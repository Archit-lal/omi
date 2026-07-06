/* omi iOS — device frame builders. Depends on common.js (icon()). */

// real mobile nav = 4 tabs
const IOS_TABS = [
  { id:'home', icon:'home', label:'Home' },
  { id:'conversations', icon:'msg', label:'Conversations' },
  { id:'tasks', icon:'check', label:'Tasks' },
  { id:'apps', icon:'apps', label:'Apps' },
];
const IOS_DEST = { home:'ios-home', conversations:'ios-conversations', tasks:'ios-tasks', apps:'ios-apps' };

function iosGo(file){ const t = document.documentElement.dataset.theme || new URLSearchParams(location.search).get('theme') || 'light'; location.href = `${file}.html?theme=${t}`; }

function statusBar() {
  return `<div class="statusbar">
    <span>9:41</span>
    <span class="sb-right">
      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="14" width="3" height="6" rx="1"/><rect x="7" y="10" width="3" height="10" rx="1"/><rect x="12" y="6" width="3" height="14" rx="1"/><rect x="17" y="3" width="3" height="17" rx="1"/></svg>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12a15 15 0 0 1 20 0"/><path d="M5 15.5a10 10 0 0 1 14 0"/><path d="M8.5 19a5 5 0 0 1 7 0"/></svg>
      <svg viewBox="0 0 26 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.5" y="7" width="19" height="10" rx="3"/><rect x="3.5" y="9" width="12" height="6" rx="1.5" fill="currentColor" stroke="none"/><path d="M22.5 10.5v3" stroke-linecap="round"/></svg>
    </span>
  </div>`;
}

// battery/device pill (left) — tap → device page
function batteryPill(){
  return `<div class="devpill" onclick="iosGo('ios-device')">
    <svg viewBox="0 0 26 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.5" y="7" width="17" height="10" rx="2.5"/><rect x="3.5" y="9" width="10" height="6" rx="1" fill="currentColor" stroke="none"/><path d="M20.5 10.5v3" stroke-linecap="round"/></svg>
    omi · 78%<span class="bd"></span>
  </div>`;
}
// settings gear (right)
function gearBtn(){ return `<div class="icon-btn" onclick="iosGo('ios-settings')">${icon('settings')}</div>`; }
// top bar: battery pill left, optional centered title, gear right
function deviceBar(title){
  return `<div class="devbar">${batteryPill()}${title?`<span class="devbar-t">${title}</span>`:''}${gearBtn()}</div>`;
}

// the omi ring buddy for iOS
function iosBuddy(cls){ return `<div class="buddy ${cls||''}"><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span></div>`; }

// phone({ app, tab, float }) — app = scrollable body; tab = active tab id; float = HTML pinned above the tab bar
function phone({ app='', tab=null, float='' }) {
  return `<div class="bezel">
    <div class="screen">
      <div class="island"></div>
      ${statusBar()}
      <div class="app ${tab?'':'nopad'}">${app}</div>
      ${float ? `<div class="floatslot ${tab?'has-tab':''}">${float}</div>` : ''}
      ${tab ? tabBar(tab) : ''}
      <div class="home-ind"></div>
    </div>
  </div>`;
}

function tabBar(active) {
  const t = IOS_TABS.map(x =>
    `<div class="tab ${x.id===active?'active':''}" onclick="iosGo('${IOS_DEST[x.id]}')">${x.badge?'<span class="tdot"></span>':''}${icon(x.icon)}<span>${x.label}</span></div>`
  ).join('');
  return `<div class="tabbar">${t}</div>`;
}

document.body.classList.add('ios');
