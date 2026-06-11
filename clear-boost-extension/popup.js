'use strict';
document.addEventListener('DOMContentLoaded',()=>{
const _0x1=document.getElementById('statusCard');
const _0x2=document.getElementById('statusDot');
const _0x3=document.getElementById('statusLabel');
const _0x4=document.getElementById('injectionCount');
const _0x5=document.getElementById('lastActive');
const _0x6=document.getElementById('currentPage');
const _0x7=document.getElementById('authStatus');
const _0x8=document.getElementById('keyInput');
const _0x9=document.getElementById('activateBtn');
const _0xa=document.getElementById('removeBtn');
const _0xb=document.getElementById('keyInputRow');
const _0xc=document.getElementById('keyActiveRow');
const _0xd=document.getElementById('keyDisplay');
const _0xe=document.getElementById('keyStatus');
const _0xf=document.getElementById('engineToggle');

chrome.storage.local.get(['enabled','licenseKey'],(_0x10)=>{
_0xf.checked=_0x10.enabled!==false;
if(_0x10.licenseKey){_0x11(_0x10.licenseKey);}else{_0x12();}
_0x13();
});

_0xf.addEventListener('change',()=>{
chrome.storage.local.set({enabled:_0xf.checked},()=>{
_0x13();
chrome.runtime.sendMessage({type:'TOGGLE_ENGINE',enabled:_0xf.checked});
});
});

function _0x13(){
chrome.runtime.sendMessage({type:'GET_TAB_STATUS'},(_0x14)=>{
if(chrome.runtime.lastError||!_0x14){_0x15('error','CONNECTION ERROR');return;}
const {tabStatus:_0x16,totalInjections:_0x17,lastActive:_0x18,hasKey:_0x19}=_0x14;
const _0x1a=_0xf.checked;
if(!_0x19){
_0x15('nokey','KEY REQUIRED');
_0x7.textContent='No key';
_0x7.style.color='#ff8800';
}else if(!_0x1a){
_0x15('idle','DISABLED');
_0x7.textContent='Disabled';
_0x7.style.color='#666';
}else if(_0x16.status==='active'){
_0x15('active','EXTENSION ACTIVE');
_0x7.textContent='Authorized ✓';
_0x7.style.color='#00ff41';
}else if(_0x16.status==='unauthorized'){
_0x15('error','UNAUTHORIZED');
_0x7.textContent='Invalid key';
_0x7.style.color='#ff3333';
}else if(_0x16.status==='error'){
_0x15('error','INJECTION FAILED');
_0x7.textContent='Error';
_0x7.style.color='#ff3333';
}else{
_0x15('idle','STANDBY');
_0x7.textContent='Ready';
_0x7.style.color='#666';
}
_0x4.textContent=_0x17.toLocaleString();
_0x5.textContent=_0x18?_0x1b(_0x18):'—';
});
}

chrome.tabs.query({active:true,currentWindow:true},(_0x1c)=>{
if(_0x1c[0]?.url){
try{
_0x6.textContent=new URL(_0x1c[0].url).hostname;
}catch(_0x1d){
_0x6.textContent='N/A';
}
}
});

_0x9.addEventListener('click',()=>{
const _0x1e=_0x8.value.trim();
if(!_0x1e){_0x1f('Enter a key','#ff3333');return;}
_0x9.textContent='...';
_0x9.disabled=true;
chrome.runtime.sendMessage({type:'SAVE_KEY',key:_0x1e},(_0x20)=>{
if(_0x20?.success){
_0x1f('✓ ACTIVATED','#00ff41');
_0x11(_0x1e);
_0x13();
}else{
_0x1f('✕ INVALID KEY','#ff3333');
_0x9.textContent='ACTIVATE';
_0x9.disabled=false;
}
});
});

_0x8.addEventListener('keydown',(_0x21)=>{if(_0x21.key==='Enter')_0x9.click();});

_0xa.addEventListener('click',()=>{
chrome.runtime.sendMessage({type:'REMOVE_KEY'},()=>{
_0x12();
_0x1f('Key removed','#666');
_0x13();
});
});

function _0x11(_0x22){
_0xb.style.display='none';
_0xc.style.display='flex';
const _0x23=_0x22.substring(0,3)+'•'.repeat(Math.max(0,_0x22.length-7))+_0x22.substring(_0x22.length-4);
_0xd.textContent=_0x23;
}

function _0x12(){
_0xb.style.display='flex';
_0xc.style.display='none';
_0x8.value='';
_0x9.textContent='ACTIVATE';
_0x9.disabled=false;
}

function _0x1f(_0x24,_0x25){
_0xe.textContent=_0x24;
_0xe.style.color=_0x25;
setTimeout(()=>{_0xe.textContent='';},3000);
}

function _0x15(_0x26,_0x27){
_0x1.className=`status-card ${_0x26}`;
_0x2.className=`status-indicator ${_0x26}`;
_0x3.className=`status-label ${_0x26}`;
_0x3.textContent=_0x27;
}

function _0x1b(_0x28){
const _0x29=Math.floor((Date.now()-_0x28)/1000);
if(_0x29<60)return `${_0x29}s ago`;
const _0x2a=Math.floor(_0x29/60);
if(_0x2a<60)return `${_0x2a}m ago`;
const _0x2b=Math.floor(_0x2a/60);
if(_0x2b<24)return `${_0x2b}h ago`;
return `${Math.floor(_0x2b/24)}d ago`;
}
});
