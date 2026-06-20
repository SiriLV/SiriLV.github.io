(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const KEY='sirilv.webide.integration.v2';
const previewExt=new Set(['md','html','htm','svg']);
const previewMime=['image/','audio/','video/','application/pdf'];
const defaults={bgMode:'mesh',bgA:'#07090f',bgB:'#151b2d'};
const read=()=>{try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{...defaults}}};
const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
let scheduled=false,lastKey='';
function ext(p){const b=String(p||'').split('/').pop()||'',i=b.lastIndexOf('.');return i<0?'':b.slice(i+1).toLowerCase()}
function apply(){const v=read(),r=document.documentElement;r.dataset.bg=v.bgMode||'mesh';r.style.setProperty('--bg-a',v.bgA||defaults.bgA);r.style.setProperty('--bg-b',v.bgB||defaults.bgB);[['#setBgMode','bgMode'],['#setBgA','bgA'],['#setBgB','bgB']].forEach(([id,prop])=>{const el=$(id);if(el)el.value=v[prop]||defaults[prop]})}
function bind(){[['#setBgMode','bgMode'],['#setBgA','bgA'],['#setBgB','bgB']].forEach(([id,prop])=>{const el=$(id);if(!el)return;el.addEventListener('input',()=>{const v=read();v[prop]=el.value;save(v);apply()})});const theme=$('#setTheme');if(theme)theme.addEventListener('change',()=>{document.documentElement.dataset.theme=theme.value});}
function shouldPreview(path,type){const e=ext(path);return previewExt.has(e)||previewMime.some(m=>type.startsWith(m)||type.includes(m))}
function patchPreview(){scheduled=false;const panel=$('#previewPanel'),body=$('#previewBody'),path=$('#statusPath')?.textContent||'',type=$('#statusLang')?.textContent||'';if(!panel||panel.hidden||!body)return;const key=path+'|'+type;if(shouldPreview(path,type)){lastKey='';return}if(lastKey===key&&body.dataset.previewBlocked==='1')return;lastKey=key;body.dataset.previewBlocked='1';body.innerHTML='<div class="preview-note"><h2>Preview unavailable</h2><p>Preview is kept for Markdown, HTML, SVG, images, PDF, audio and video. Source code stays only in the editor, so the page does not duplicate large files or waste render time.</p></div>'}
function schedulePatch(){if(scheduled)return;scheduled=true;requestAnimationFrame(patchPreview)}
function observe(){const panel=$('#previewPanel'),status=$('#statusPath'),lang=$('#statusLang');if(panel)new MutationObserver(schedulePatch).observe(panel,{attributes:true,attributeFilter:['hidden']});if(status)new MutationObserver(schedulePatch).observe(status,{childList:true,characterData:true,subtree:true});if(lang)new MutationObserver(schedulePatch).observe(lang,{childList:true,characterData:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest('[data-action="preview"],#closePreview,.tab,.tree-row'))schedulePatch()});document.addEventListener('keyup',schedulePatch)}
document.addEventListener('DOMContentLoaded',()=>{apply();bind();observe();schedulePatch()});
})();
