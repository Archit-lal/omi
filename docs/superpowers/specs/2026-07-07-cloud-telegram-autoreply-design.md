# Cloud Telegram Auto-Reply — Design

**Date:** 2026-07-07
**Status:** Approved for planning
**Goal:** Telegram messaging auto-reply keeps working when the user's Mac is off.

## Problem

Today, Telegram auto-reply lives entirely on the Mac:

- The Telegram MTProto session (a Telethon `StringSession`) is stored **only** on-device at
  `~/Library/Application Support/Omi/telegram.session`.
- A local helper subprocess (`desktop/macos/telegram-helper/omi_telegram_helper.py`) owns **both**
  receiving inbound messages and sending replies.
- The auto-reply orchestration (decide whether to reply, request a draft, choose send vs. escalate)
  runs in Swift (`desktop/macos/Desktop/Sources/TelegramInboxStore.swift`).
- The cloud backend holds no Telegram session and cannot send; it only drafts reply text on request
  (`backend/routers/telegram.py` → `reply_scheduling.draft_reply_with_scheduling`).

So when the laptop is off: nothing receives the inbound message, nothing runs the reply loop, and
nothing can send. The whole feature is dark.

## Requirement

An always-on cloud component must hold a copy of the Telegram session and run a persistent
listener + reply loop, so replies send with the Mac off.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Session location | **Always cloud** — a cloud worker permanently owns receive + send; Mac becomes a viewer / on-demand drafter. |
| Scope | **Just this user's account first** — one worker, one session. Multi-tenant scaling deferred. |
| Hosting | **Persistent single-replica GKE worker** (Telethon client always connected). Template: `agent-proxy`. |
| Escalation (`needs_input`) | **Push to phone** (Omi mobile app) → approve/edit from phone. |
| Delivery | **Build all at once** — worker + mobile approval UI land together. |
| Mac role when cloud ON | **Cloud always owns auto-reply**, even if the Mac is also on. Mac = viewer / manual drafts. Single code path, no race. |
| Session bootstrap | **Upload from Mac** — encrypt the existing on-device StringSession and upload once. No phone re-login. |

## Architecture

```
Telegram (MTProto)
      │  live updates                                    ▲ send_message
      ▼                                                   │
┌───────────────────────── telegram-worker (NEW) ─────────────────────────┐
│ single-replica GKE Deployment · always-connected Telethon client(s)      │
│                                                                          │
│  new_message handler  ──►  ingest (telegram_connector, deduped)          │
│                       ──►  reply loop (ports Swift TelegramInboxStore):   │
│                              reply_scheduling.draft_reply_with_scheduling │
│                              ├─ confident         → claim reply → send    │
│                              ├─ ambiguous/abstain → drop                  │
│                              └─ needs_input       → pending_replies + push│
│  watches pending_replies for status=approved      → send final_text      │
└──────────────────────────────────────────────────────────────────────────┘
      │ reads/writes                       │ send_notification()
      ▼                                     ▼
   Firestore                          Omi mobile app  ──►  approve/edit screen (NEW)
   · users/{uid}/integrations/telegram (session, settings, registry)
   · processed_messages/{key}   (ingest + reply claims)
   · pending_replies/{id}       (needs_input suggestions + approval state)
```

The reply "brains" (`reply_draft.py`, `reply_scheduling.py`) already run in the backend Python
process, so the worker calls `draft_reply_with_scheduling(...)` **in-process** — no HTTP hop.

## Components

### 1. `telegram-worker` service (new)

- New Python service (`backend/telegram-worker/` + Helm chart `backend/charts/telegram-worker/`),
  single-replica GKE `Deployment` modeled on `agent-proxy`.
- **Shared MTProto module:** extract the receive/send/session logic from
  `desktop/macos/telegram-helper/omi_telegram_helper.py` into a module importable by both the Mac
  helper and the worker (avoid duplication). The worker instantiates a Telethon client from the
  decrypted StringSession and registers a live `new_message` handler.
- **User enumeration:** a Firestore registry (`telegram_cloud_users`, modeled on
  `x_connector`'s registry). Phase 1 contains only this user. Worker loads registered users on
  startup; picks up newly-registered users on a short poll / watch.
- **Resilience:** reconnect with backoff on disconnect; `catch_up` on reconnect so messages missed
  during a blip are processed. Health/liveness endpoint for GKE probes.

### 2. Session bootstrap (Mac → cloud)

- New Mac action **"Enable cloud auto-reply"** reads the local StringSession and calls a new
  endpoint `POST /v1/telegram/cloud-session`.
- Endpoint does `encryption.encrypt(session, uid)` and stores it at
  `users/{uid}/integrations/telegram.session`, then registers the user in `telegram_cloud_users`.
  (`set_integration` does **not** encrypt on its own — we wrap explicitly.)
- One StringSession can back two live clients simultaneously (Mac + cloud), like Telegram
  multi-device. No re-login needed.
- **Disable path:** a "Disable cloud auto-reply" action deletes the stored session + registry entry;
  the worker drops that client.

### 3. Auto-reply orchestration (ported from Swift)

Worker's `new_message` handler mirrors `TelegramInboxStore.handleThread` / `autoReply`:

1. Build a `TelegramThread` from the inbound update.
2. Ingest via existing `telegram_connector` (deduped by `claim_message`).
3. If the chat is auto-reply-enabled (see §5), call
   `reply_scheduling.draft_reply_with_scheduling(uid, person, thread, intent, is_group, media_context)`.
4. Branch on the response:
   - `ambiguous` or `abstain` → do not send.
   - `needs_input` → write suggestion to `pending_replies` + push (see §6). Do not send.
   - otherwise → **claim the reply (§4), then send** via Telethon `send_message`. If a calendar
     `hold` was created, keep it tentative and record it on the pending/inbox record for
     confirm/discard.

### 4. Double-send prevention (Mac ↔ cloud, and worker restarts)

- **Ownership rule:** when cloud mode is ON, the cloud is the **sole** auto-sender. The Mac
  suppresses its own auto-send (new flag read at startup + on settings change); the Mac helper still
  ingests/drafts on demand but never auto-sends. This removes the dual-owner race by construction.
- **Reply-claim ledger:** add a sibling `reply_claims/{key}` collection (kept separate because
  `processed_messages` means "ingested", not "replied") with an atomic **reply claim** using the
  existing `claim_message`-style `doc.create()` keyed by `chat_id:message_id`. The worker claims
  before sending; a restart mid-flight cannot double-send because the claim already exists. Record
  `replied_at` / `reply_status` on the claim doc on success.

### 5. Settings moved server-side

- The per-chat opt-in list `autoReplyChats` currently lives in Mac `UserDefaults` — invisible to the
  worker. Replicate it to `users/{uid}/integrations/telegram.auto_reply_chats`; the Mac writes it via
  the existing settings endpoint (`PUT /v1/telegram/settings`, extended).
- `opted_out_handles` is already server-side and is respected as-is.
- The worker reads these from Firestore on each decision (or caches with a short TTL / watch).

### 6. Escalation via push (`needs_input`)

- On `needs_input`: write `{chat_id, message_id, suggestion, reason, status: "pending"}` to
  `pending_replies/{id}`, then call
  `utils.notifications.send_notification(uid, title, reason, data={navigate_to: <approve screen>, pending_reply_id})`.
  Tokens live in `users/{uid}/fcm_tokens`.

### 7. Mobile approval surface (new, Flutter)

- New screen in `app/`: list of `pending_replies` with **Approve / Edit / Dismiss**.
- Deep-linked from the push `navigate_to`.
- All user-facing strings via l10n (`context.l10n.*`), translated to all non-English locales.
- Approve/Edit sets `status="approved", final_text=<text>` on the `pending_replies` doc.
  Dismiss sets `status="dismissed"`.
- The REST backend **cannot** send Telegram (no session), so approval reaches the worker via
  Firestore: the always-connected worker **watches `pending_replies` for `status=="approved"`** and
  sends `final_text` via Telethon, then marks `status="sent"`.

## Data model changes (Firestore)

- `users/{uid}/integrations/telegram`
  - `session: <encrypted string>` (new)
  - `auto_reply_chats: [chat_id, …]` (new; replicated from Mac)
  - `cloud_enabled: bool` (new)
- `telegram_cloud_users/{uid}` — registry doc (new).
- `users/{uid}/integrations/telegram/reply_claims/{key}` (new) — atomic reply-claim doc:
  `chat_id, message_id, reply_status, replied_at, reply_claimed_by`.
- `users/{uid}/integrations/telegram/pending_replies/{id}` (new)
  - `chat_id, message_id, suggestion, reason, status, final_text, created_at`.

## API changes (backend)

- `POST /v1/telegram/cloud-session` (new) — store encrypted session + register user.
- `POST /v1/telegram/cloud-session/disconnect` (new) — clear session + registry.
- `PUT /v1/telegram/settings` (extended) — accept `auto_reply_chats`, `cloud_enabled`.
- `GET /v1/telegram/pending-replies` (new) — list for the mobile screen.
- `POST /v1/telegram/pending-replies/{id}/resolve` (new) — set approved/edited/dismissed
  (writes Firestore state the worker watches; does **not** itself send).

Existing `draft-reply` / `threads` endpoints are unchanged; the worker calls the drafting code
in-process rather than via `draft-reply`.

## Testing / verification

- **Unit:** reply-claim atomicity (concurrent claim → exactly one send); settings gating
  (opted-out / non-auto-reply chats never send); branch handling of
  `ambiguous`/`abstain`/`needs_input`. Follows the Definition-of-Done "behavior changed → test
  changed" rule.
- **End-to-end (the real proof):** run the worker locally against the uploaded session with the Mac
  app **closed** (or its auto-send suppressed). From a second Telegram account, message the user and
  confirm the worker auto-replies. Then force a `needs_input` case and confirm the push fires and the
  mobile approve→send round-trips.
- **Regression guard:** with cloud mode ON and the Mac also on, exactly one reply is sent (no
  duplicate) — validates the ownership rule + reply-claim.

## Risks & notes

- **Telegram anti-abuse:** the session logs in from a datacenter IP; a single stable long-lived
  connection (this design) looks the most normal. Monitor for auth challenges; keep the disable path
  handy.
- **Secret handling:** the StringSession is full account access. It is encrypted per-user
  (`encryption.encrypt`, AES-256-GCM via HKDF from `ENCRYPTION_SECRET`) at rest and never logged
  (`sanitize`/`sanitize_pii` for any diagnostics).
- **Calendar holds:** confident auto-replies that create a tentative `hold` need a confirm/discard
  surface. MVP: keep the hold tentative and surface confirm/discard on the same mobile screen (or the
  Mac when it returns). Not on the critical path for "replies send laptop-off."
- **Docs:** update the backend service map in `AGENTS.md` (new `telegram-worker` service and its
  Firestore/Telegram edges) and the messaging connector docs in the same PR.
