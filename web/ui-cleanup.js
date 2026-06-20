(()=>{
'use strict';
const CLEAN_MAP=new Map([
  ['localStorage + cookie','saved locally'],
  ['cookie-ready','ready'],
  ['browser editor for working with files on any device.','file workspace'],
  ['Codium-style static editor','File workspace']
]);
function cleanTextNode(node){if(!node||node.nodeType!==3)return;let text=node.nodeValue,next=text;for(const[from,to]of CLEAN_MAP)next=next.replaceAll(from,to);if(next!==text)node.nodeValue=next}
function walk(root=document.body){const it=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=it.nextNode()))cleanTextNode(n)}
function cleanStatus(){const s=document.querySelector('#statusStorage');if(s){if(s.textContent.includes('localStorage')||s.textContent.includes('cookie'))s.textContent='saved locally'}}
function cleanWorkspaceReadme(){try{const keys=Object.keys(localStorage).filter(k=>k.startsWith('sirilv.webide.workspace.'));for(const key of keys){const ws=JSON.parse(localStorage.getItem(key)||'null');const readme=ws?.children?.['README.md'];if(!readme||typeof readme.content!=='string')continue;let c=readme.content;c=c.replace('Код здесь не запускается. Это редактор файлов, а не полноценный удалённый контейнер. Для запуска, git commit/push и терминала нужен backend/OAuth или отдельная серверная часть.','Это редактор файлов для быстрых правок и подготовки проектов.');c=c.replaceAll('localStorage и cookie-метаданные','сохранение прошлой сессии');c=c.replaceAll('backend/OAuth','серверная часть');readme.content=c;localStorage.setItem(key,JSON.stringify(ws));}}catch{}}
document.addEventListener('DOMContentLoaded',()=>{cleanWorkspaceReadme();walk();cleanStatus();setInterval(cleanStatus,1000)});
})();
