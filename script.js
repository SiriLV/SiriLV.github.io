(()=>{
'use strict';
const KEY='sirilv.hub.theme.v1';
const $=s=>document.querySelector(s);
function apply(theme){document.documentElement.dataset.theme=theme;localStorage.setItem(KEY,theme)}
function tick(){const c=$('#clock');if(c)c.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
document.addEventListener('DOMContentLoaded',()=>{
  apply(localStorage.getItem(KEY)||'dark');
  tick();setInterval(tick,1000);
  const btn=$('#themeBtn'),panel=$('#themePanel');
  btn?.addEventListener('click',e=>{e.stopPropagation();panel.hidden=!panel.hidden});
  panel?.addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(!b)return;apply(b.dataset.theme);panel.hidden=true});
  document.addEventListener('click',e=>{if(!e.target.closest('#themePanel,#themeBtn'))panel.hidden=true});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')panel.hidden=true});
});
})();
