async function loadJSON(path){try{return await (await fetch(path)).json()}catch(e){return []}}
document.addEventListener('DOMContentLoaded',async()=>{
const s=document.querySelector('#servers'); if(s){const data=await loadJSON('data/servers.json');s.innerHTML=data.map(x=>`<tr><td><b>${x.name}</b></td><td>${x.players}</td><td>${x.map}</td><td>${x.ip}</td></tr>`).join('')||'<tr><td colspan="4">Нет серверов</td></tr>'}
const u=document.querySelector('#users'); if(u){const data=await loadJSON('data/users.json');const render=(q='')=>u.innerHTML=data.filter(x=>x.name.toLowerCase().includes(q.toLowerCase())).map(x=>`<div class="user"><b>${x.name}</b> · ${x.status}</div>`).join('')||'<p>Ничего не найдено.</p>';render();document.querySelector('#userSearch')?.addEventListener('input',e=>render(e.target.value))}
document.querySelector('#loginForm')?.addEventListener('submit',e=>{e.preventDefault();alert('Демо-режим: подключи свой backend для реальной авторизации.')});
document.querySelector('#registerForm')?.addEventListener('submit',e=>{e.preventDefault();alert('Демо-режим: подключи свой backend для регистрации.')});
});
function toggleNav(){document.querySelector('.nav nav').style.display='flex'}