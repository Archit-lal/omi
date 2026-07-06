/* omi mockup — shared chrome, nav, icons. Keep every screen DRY + consistent. */

// Minimal Lucide-style stroke icons (24x24, currentColor).
const I = {
  home:   '<path d="M3 10.5 12 4l9 6.5"/><path d="M5 9.5V20h14V9.5"/>',
  ask:    '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
  brain:  '<path d="M8.5 4A3.5 3.5 0 0 0 5 7.5 3 3 0 0 0 4 13a3 3 0 0 0 2 4.5A3 3 0 0 0 9 21a2.5 2.5 0 0 0 3-2.5V5.5A2.5 2.5 0 0 0 9.5 3a3.5 3.5 0 0 0-1 1z"/><path d="M15.5 4A3.5 3.5 0 0 1 19 7.5 3 3 0 0 1 20 13a3 3 0 0 1-2 4.5A3 3 0 0 1 15 21a2.5 2.5 0 0 1-3-2.5"/>',
  msg:    '<path d="M4 5h16v11H8l-4 3z"/>',
  rewind: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>',
  apps:   '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  cal:    '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
  mail:   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  file:   '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  note:   '<path d="M5 4h14v16H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  check:  '<path d="m4 12 5 5L20 6"/>',
  arrowUp:'<path d="M12 20V5M6 11l6-6 6 6"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  mic:    '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  screen: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  cmd:    '<path d="M9 9V7a2 2 0 1 0-2 2h10a2 2 0 1 0-2-2v10a2 2 0 1 0 2-2H7a2 2 0 1 0 2 2z"/>',
  send:   '<path d="M4 12 20 4l-6 16-3.5-6.5z"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  x:      '<path d="M6 6l12 12M18 6 6 18"/>',
  chev:   '<path d="m9 6 6 6-6 6"/>',
  chevD:  '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  users:  '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>',
  share:  '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8"/>',
  bolt:   '<path d="M13 3 4 14h6l-1 7 9-11h-6z"/>',
  clock:  '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  star:   '<path d="m12 4 2.4 5 5.6.6-4 3.9 1 5.5-5-2.9-5 2.9 1-5.5-4-3.9 5.6-.6z"/>',
  code:   '<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>',
  flag:   '<path d="M5 21V4h10l-1.5 3L15 10H5"/>',
  eye:    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  lock:   '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  bell:   '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
};

function icon(name, cls) {
  const p = I[name] || '';
  return `<svg class="${cls||'icon'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}

// primary nav — deliberately 5 items + settings. Everything else is one keystroke away.
const NAV = [
  { id:'home',   icon:'home',   label:'Home' },
  { id:'ask',    icon:'ask',    label:'Ask omi' },
  { id:'memory', icon:'brain',  label:'Memory' },
  { id:'messages',icon:'msg',   label:'Messages', badge:true },
  { id:'rewind', icon:'rewind', label:'Rewind' },
];

// where each rail id navigates
const RAIL_DEST = { home:'home', ask:'ask', memory:'memory', messages:'messages-imessage', rewind:'rewind', apps:'apps', settings:'settings' };

// navigate to another screen, preserving the current theme
function go(file){
  const t = document.documentElement.dataset.theme || new URLSearchParams(location.search).get('theme') || 'light';
  const dest = file.endsWith('.html') ? file : file + '.html';
  // if we're inside the launcher iframe, ask it to swap; else navigate directly
  if (window.parent !== window && window.parent.postMessage) {
    try { window.parent.postMessage({ omiGo: dest }, '*'); } catch(e){}
  }
  location.href = `${dest}?theme=${t}`;
}
// the mini omi-ring mark (used in the rail + wherever a small logo is needed)
function omiMark(cls){ return `<div class="buddy ${cls||'sm'}"><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span></div>`; }

function rail(active) {
  const items = NAV.map(n =>
    `<a class="rail-item ${n.id===active?'active':''}" title="${n.label}" onclick="go('${RAIL_DEST[n.id]}')">${icon(n.icon)}${n.badge?'<span class="rail-badge"></span>':''}</a>`
  ).join('');
  return `<nav class="rail">
    <a class="mark" title="Home" onclick="go('home')" style="cursor:pointer">${omiMark('sm')}</a>
    ${items}
    <div class="rail-spacer"></div>
    <a class="rail-item ${active==='apps'?'active':''}" title="All features" onclick="go('more')">${icon('apps')}</a>
    <a class="rail-item ${active==='settings'?'active':''}" title="Settings" onclick="go('settings')">${icon('settings')}</a>
  </nav>`;
}

// window chrome wrapper. content = main-area HTML (already includes .main or custom).
// Capture (screen) + Listening (mic) shown together — omi's two live senses.
function presenceChips(presence){
  if (presence==='none') return '';
  return `<span class="tb-stat">${icon('screen','icon-sm')}<span class="live-dot"></span>Capture</span>
    <span class="tb-stat">${icon('mic','icon-sm')}<span class="live-dot"></span>Listening</span>`;
}
function windowShell({ active='home', title='omi', presence='live', body='' }) {
  return `<div class="win">
    <div class="titlebar">
      <div class="traffic"><i class="c"></i><i class="m"></i><i class="x"></i></div>
      <div class="tb-title">${title}</div>
      <div class="tb-presence">${presenceChips(presence)}</div>
    </div>
    <div class="win-body">
      ${rail(active)}
      ${body}
    </div>
  </div>`;
}

// bare window chrome (no nav rail) — for onboarding, sign-in, share cards, spotlight.
function bareWindow({ title='omi', presence='none', body='', wide=false }) {
  return `<div class="win" ${wide?'style="width:1200px"':''}>
    <div class="titlebar">
      <div class="traffic"><i class="c"></i><i class="m"></i><i class="x"></i></div>
      <div class="tb-title">${title}</div>
      <div class="tb-presence">${presenceChips(presence)}</div>
    </div>
    <div class="win-body" style="display:block;overflow:auto">${body}</div>
  </div>`;
}

// theme init from ?theme= or default light; expose toggle for the launcher.
(function(){
  const p = new URLSearchParams(location.search);
  const t = p.get('theme');
  if (t) document.documentElement.dataset.theme = t;
})();
