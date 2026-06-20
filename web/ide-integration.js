(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const KEY='sirilv.webide.integration.v1';
const previewExt=new Set(['md','html','htm','svg']);
const previewMime=['image/','audio/','video/','application/pdf'];
const defaults={bgMode:'mesh',bgA:'#07090f',bgB:'#151b2d'};
const read=()=>{try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{...defaults}}};
const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
function ext(p){const b=String(p||'').split('/').pop()||'',i=b.lastIndexOf('.');return i<0?'':b.slice(i+1).toLowerCase()}
function apply(){const v=read(),r=document.documentElement;r.dataset.bg=v.bgMode||'mesh';r.style.setProperty('--bg-a',v.bgA||defaults.bgA);r.style.setProperty('--bg-b',v.bgB||defaults.bgB);['BgMode','BgA','BgB'].forEach(k=>{const el=$('#set'+k),prop=k[0].toLowerCase()+k.slice(1);if(el)el.value=v[prop]||defaults[prop]})}
function bind(){['BgMode','BgA','BgB'].forEach(k=>{const el=$('#set'+k);if(!el)return;el.addEventListener('input',()=>{const v=read(),prop=k[0].toLowerCase()+k.slice(1);v[prop]=el.value;save(v);apply()})});
  const theme=$('#setTheme');
  if(theme)theme.addEventListener('change',()=>{document.documentElement.dataset.theme=theme.value});
}
function patchPreview(){const panel=$('#previewPanel'),body=$('#previewBody'),path=$('#statusPath')?.textContent||'';if(!panel||panel.hidden||!body)return;const type=$('#statusLang')?.textContent||'',e=ext(path);const ok=previewExt.has(e)||previewMime.some(m=>type.startsWith(m)||type.includes(m));if(ok)return;body.innerHTML='<div class="preview-note"><h2>Preview unavailable</h2><p>Preview is enabled only for Markdown, HTML, SVG, images, PDF, audio and video. Code files stay in the editor to avoid duplicated content and unnecessary render cost.</p></div>'}
function observe(){const panel=$('#previewPanel');if(!panel)return;new MutationObserver(()=>patchPreview()).observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});new MutationObserver(()=>patchPreview()).observe($('#statusPath'),{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest('[data-action="preview"],#btnPreview'))setTimeout(patchPreview,0)});}
document.addEventListener('DOMContentLoaded',()=>{apply();bind();observe();setTimeout(patchPreview,250)});
})();
