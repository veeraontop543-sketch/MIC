// CLEAR BOOST - Popup Controller (Obfuscated)
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
chrome.storage.local.get(['licenseKey'],(_0xf)=>{
if(_0xf.licenseKey){_0x10(_0xf.licenseKey);}else{_0x11();}
});
chrome.runtime.sendMessage({type:'GET_TAB_STATUS'},(_0x12)=>{
if(chrome.runtime.lastError||!_0x12){_0x13('error','CONNECTION ERROR');return;}
const {tabStatus:_0x14,totalInjections:_0x15,lastActive:_0x16,hasKey:_0x17}=_0x12;
if(!_0x17){
_0x13('nokey','KEY REQUIRED');
_0x7.textContent='No key';
_0x7.style.color='#ff8800';
}else if(_0x14.status==='active'){
_0x13('active','EXTENSION ACTIVE');
_0x7.textContent='Authorized ✓';
_0x7.style.color='#00ff41';
}else if(_0x14.status==='unauthorized'){
_0x13('error','UNAUTHORIZED');
_0x7.textContent='Invalid key';
_0x7.style.color='#ff3333';
}else if(_0x14.status==='error'){
_0x13('error','INJECTION FAILED');
_0x7.textContent='Error';
_0x7.style.color='#ff3333';
}else{
_0x13('idle','STANDBY');
_0x7.textContent=_0x17?'Ready':'No key';
_0x7.style.color=_0x17?'#666':'#ff8800';
}
_0x4.textContent=_0x15.toLocaleString();
_0x5.textContent=_0x16?_0x18(_0x16):'—';
});
chrome.tabs.query({active:true,currentWindow:true},(_0x19)=>{
if(_0x19[0]?.url){
try{
_0x6.textContent=new URL(_0x19[0].url).hostname;
}catch(_0x1a){
_0x6.textContent='N/A';
}
}
});
_0x9.addEventListener('click',()=>{
const _0x1b=_0x8.value.trim();
if(!_0x1b){_0x1c('Enter a key','#ff3333');return;}
_0x9.textContent='...';
_0x9.disabled=true;
chrome.runtime.sendMessage({type:'SAVE_KEY',key:_0x1b},(_0x1d)=>{
if(_0x1d?.success){
_0x1c('✓ ACTIVATED','#00ff41');
_0x10(_0x1b);
_0x13('active','EXTENSION ACTIVE');
_0x7.textContent='Authorized ✓';
_0x7.style.color='#00ff41';
}else{
_0x1c('✕ INVALID KEY','#ff3333');
_0x9.textContent='ACTIVATE';
_0x9.disabled=false;
}
});
});
_0x8.addEventListener('keydown',(_0x1e)=>{if(_0x1e.key==='Enter')_0x9.click();});
_0xa.addEventListener('click',()=>{
chrome.runtime.sendMessage({type:'REMOVE_KEY'},()=>{
_0x11();
_0x1c('Key removed','#666');
_0x13('nokey','KEY REQUIRED');
_0x7.textContent='No key';
_0x7.style.color='#ff8800';
});
});
function _0x10(_0x1f){
_0xb.style.display='none';
_0xc.style.display='flex';
const _0x20=_0x1f.substring(0,3)+'•'.repeat(Math.max(0,_0x1f.length-7))+_0x1f.substring(_0x1f.length-4);
_0xd.textContent=_0x20;
}
function _0x11(){
_0xb.style.display='flex';
_0xc.style.display='none';
_0x8.value='';
_0x9.textContent='ACTIVATE';
_0x9.disabled=false;
}
function _0x1c(_0x21,_0x22){
_0xe.textContent=_0x21;
_0xe.style.color=_0x22;
setTimeout(()=>{_0xe.textContent='';},3000);
}
function _0x13(_0x23,_0x24){
_0x1.className=`status-card ${_0x23}`;
_0x2.className=`status-indicator ${_0x23}`;
_0x3.className=`status-label ${_0x23}`;
_0x3.textContent=_0x24;
}
function _0x18(_0x25){
const _0x26=Math.floor((Date.now()-_0x25)/1000);
if(_0x26<60)return `${_0x26}s ago`;
const _0x27=Math.floor(_0x26/60);
if(_0x27<60)return `${_0x27}m ago`;
const _0x28=Math.floor(_0x27/60);
if(_0x28<24)return `${_0x28}h ago`;
return `${Math.floor(_0x28/24)}d ago`;
}
});
