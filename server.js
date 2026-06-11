const express=require("express");
const path=require("path");
const fs=require("fs");
const crypto=require("crypto");

const app=express();

const KEYS_FILE = path.join(__dirname, "keys.json");
const MASTER_PASSWORD = "CLEARBOOST_MASTER_2026";

// Load keys from keys.json or initialize with default owner key
let AUTHORIZED_KEYS = new Set();

function loadKeys() {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const data = fs.readFileSync(KEYS_FILE, "utf8");
      const keysArray = JSON.parse(data);
      AUTHORIZED_KEYS = new Set(keysArray);
      console.log(`[Clear Boost] Loaded ${AUTHORIZED_KEYS.size} keys from storage.`);
    } else {
      // Default initial keys
      const initialKeys = ["CB-VK-OWNER-2026"];
      fs.writeFileSync(KEYS_FILE, JSON.stringify(initialKeys, null, 2), "utf8");
      AUTHORIZED_KEYS = new Set(initialKeys);
      console.log("[Clear Boost] Created keys.json with default owner key.");
    }
  } catch (err) {
    console.error("[Clear Boost] Error loading keys file, falling back to default:", err);
    AUTHORIZED_KEYS = new Set(["CB-VK-OWNER-2026"]);
  }
}

function saveKeys() {
  try {
    const keysArray = Array.from(AUTHORIZED_KEYS);
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keysArray, null, 2), "utf8");
    console.log("[Clear Boost] Keys successfully saved to keys.json.");
  } catch (err) {
    console.error("[Clear Boost] Error saving keys to file:", err);
  }
}

// Initial load
loadKeys();

// ── Rate limiting ──────────────────────────────────────────────
const requestCount=new Map();
const getRateLimit=(ip)=>{
 const now=Date.now();
 const count=requestCount.get(ip)||[];
 const recent=count.filter(t=>now-t<60000);
 if(recent.length>=15) return false;
 recent.push(now);
 requestCount.set(ip,recent);
 return true;
};

// ── Security headers ───────────────────────────────────────────
app.use((req,res,next)=>{
 res.header("X-Content-Type-Options","nosniff");
 res.header("X-Frame-Options","DENY");
 res.header("Cache-Control","no-cache, no-store, must-revalidate, private");
 res.header("Pragma","no-cache");
 res.header("Expires","0");
 res.header("X-XSS-Protection","1; mode=block");
 res.header("Access-Control-Allow-Origin","*");
 res.header("Access-Control-Allow-Headers","X-License-Key");
 next();
});

// ── Rate limit middleware ──────────────────────────────────────
app.use((req,res,next)=>{
 if(!getRateLimit(req.ip)){
  return res.status(429).json({error:"Too many requests"});
 }
 next();
});

// ── Home ───────────────────────────────────────────────────────
app.get("/",(req,res)=>{ res.redirect("/setup"); });

// ── Mobile Setup Page ──────────────────────────────────────────
app.get("/setup",(req,res)=>{
 const bookmarkletCode = `javascript:(function(){var k=localStorage.getItem('kc_key');if(!k){k=prompt('Enter your Kickass Corp license key:');if(!k)return;localStorage.setItem('kc_key',k);}var el=document.getElementById('__kc_active__');if(el){alert('Kickass Corp already active!');return;}fetch('https://mic-wcr4.onrender.com/script?key='+encodeURIComponent(k),{cache:'no-cache'}).then(function(r){if(r.status===401||r.status===403){localStorage.removeItem('kc_key');alert('Invalid key! Tap again to re-enter.');return r.text();}if(!r.ok)throw new Error('Server error '+r.status);return r.text();}).then(function(code){if(!code)return;if(code.startsWith('javascript:'))code=code.substring(11);var s=document.createElement('script');s.id='__kc_active__';s.textContent=code;document.documentElement.appendChild(s);console.log('[Kickass Corp] Script injected!');}).catch(function(e){alert('Kickass Corp Error: '+e.message);});})();`;

 res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Kickass Corp — Mobile Setup</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0a0a0a;color:#fff;font-family:'Segoe UI',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:24px 16px;}
.logo{font-size:28px;font-weight:900;letter-spacing:2px;color:#ff0033;text-shadow:0 0 20px #ff003388;margin:32px 0 8px;}
.sub{font-size:13px;color:#555;letter-spacing:3px;margin-bottom:40px;}
.card{background:#111;border:1px solid #222;border-radius:16px;padding:24px;width:100%;max-width:420px;margin-bottom:20px;}
.card h2{font-size:15px;letter-spacing:2px;color:#ff0033;margin-bottom:16px;text-transform:uppercase;}
.step{display:flex;gap:14px;align-items:flex-start;margin-bottom:18px;}
.step-num{background:#ff0033;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
.step p{font-size:14px;color:#ccc;line-height:1.6;}
.step p b{color:#fff;}
.bm-link{display:block;background:linear-gradient(135deg,#ff0033,#cc0022);color:#fff;text-align:center;padding:16px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:2px;text-decoration:none;margin:16px 0;box-shadow:0 4px 20px #ff003344;cursor:pointer;}
.bm-link:active{opacity:0.8;}
.info{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:10px;padding:14px;font-size:12px;color:#555;line-height:1.7;margin-top:8px;}
.info span{color:#ff0033;}
.key-section{margin-top:16px;}
.key-section input{width:100%;background:#0d0d0d;border:1px solid #333;border-radius:8px;padding:12px 14px;color:#fff;font-size:14px;letter-spacing:1px;outline:none;margin-bottom:10px;}
.key-section input:focus{border-color:#ff0033;}
.key-section button{width:100%;background:#ff0033;color:#fff;border:none;border-radius:8px;padding:13px;font-size:14px;font-weight:700;letter-spacing:2px;cursor:pointer;}
.key-section button:active{opacity:0.8;}
.msg{font-size:13px;margin-top:8px;min-height:18px;text-align:center;}
.badge{display:inline-block;background:#ff003322;border:1px solid #ff003355;color:#ff0033;font-size:10px;padding:3px 8px;border-radius:20px;letter-spacing:1px;margin-bottom:12px;}
</style>
</head>
<body>
<div class="logo">KICKASS CORP</div>
<div class="sub">AUDIO ENGINE — MOBILE SETUP</div>

<div class="card">
  <div class="badge">STEP 1 — SAVE YOUR KEY</div>
  <h2>Enter License Key</h2>
  <div class="key-section">
    <input type="text" id="keyIn" placeholder="CB-XXXX-XXXXXX" autocomplete="off" spellcheck="false"/>
    <button onclick="saveKey()">SAVE KEY</button>
    <div class="msg" id="keyMsg"></div>
  </div>
</div>

<div class="card">
  <div class="badge">STEP 2 — ADD BOOKMARKLET</div>
  <h2>Mobile Bookmarklet</h2>
  <div class="step">
    <div class="step-num">1</div>
    <p><b>Long press</b> the red button below → tap <b>"Add Bookmark"</b></p>
  </div>
  <div class="step">
    <div class="step-num">2</div>
    <p>Save it as <b>"KC Boost"</b> in your bookmarks</p>
  </div>
  <div class="step">
    <div class="step-num">3</div>
    <p>Open <b>Discord web</b> on mobile → tap the bookmark → script runs!</p>
  </div>
  <a class="bm-link" href="${bookmarkletCode.replace(/"/g,'&quot;')}" id="bmLink">🔊 TAP &amp; HOLD → ADD BOOKMARK</a>
  <div class="info">
    <span>How it works:</span> Bookmark la tap pannuna Discord page la automatically audio script inject aagum. Key browser la save aagum — next time tap panna matten.
  </div>
</div>

<div class="card">
  <h2>Usage</h2>
  <div class="step">
    <div class="step-num">✓</div>
    <p>Discord.com open pannu → address bar la <b>bookmark icon</b> tap pannu → <b>KC Boost</b> select pannu</p>
  </div>
  <div class="step">
    <div class="step-num">✓</div>
    <p>Works on <b>Chrome, Safari, Firefox</b> — any mobile browser!</p>
  </div>
  <div class="step">
    <div class="step-num">✓</div>
    <p>Key wrong-a irundha automatic-a <b>re-enter</b> kekum</p>
  </div>
</div>

<script>
function saveKey(){
  var k=document.getElementById('keyIn').value.trim();
  var msg=document.getElementById('keyMsg');
  if(!k){msg.style.color='#ff3333';msg.textContent='Enter a key first';return;}
  localStorage.setItem('kc_key',k);
  msg.style.color='#00ff41';
  msg.textContent='Key saved! Now add the bookmarklet below.';
}
// Pre-fill if key already saved
window.onload=function(){
  var k=localStorage.getItem('kc_key');
  if(k){
    document.getElementById('keyIn').value=k;
    document.getElementById('keyMsg').style.color='#00ff41';
    document.getElementById('keyMsg').textContent='Key already saved: '+k.substring(0,6)+'...';
  }
};
</script>
</body>
</html>`);
});

// ── Validate key endpoint (for popup status check) ─────────────
app.get("/auth/validate",(req,res)=>{
 const key = req.headers["x-license-key"] || req.query.key;
 if(!key){
  return res.status(401).json({valid:false, error:"No key provided"});
 }
 if(AUTHORIZED_KEYS.has(key)){
  return res.json({valid:true, message:"Authorized"});
 }
 return res.status(403).json({valid:false, error:"Invalid key"});
});

// ── Generate new key (admin only, saves dynamically!) ─────────
app.get("/admin/generate",(req,res)=>{
 const master = req.query.master;
 if(master !== MASTER_PASSWORD){
  return res.status(403).json({error:"Invalid master password"});
 }
 
 const name = (req.query.name || "FRIEND").toUpperCase().replace(/[^A-Z0-9]/g, "");
 const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
 const newKey = `CB-${name}-${rand}`;
 
 AUTHORIZED_KEYS.add(newKey);
 saveKeys();
 
 res.json({
  success: true,
  key: newKey,
  message: `Key successfully generated and activated for ${name}. You can share this key with them now!`
 });
});

// ── List all active keys (admin only) ──────────────────────────
app.get("/admin/list",(req,res)=>{
 const master = req.query.master;
 if(master !== MASTER_PASSWORD){
  return res.status(403).json({error:"Invalid master password"});
 }
 res.json({
  success: true,
  keys: Array.from(AUTHORIZED_KEYS)
 });
});

// ── Revoke a key (admin only) ──────────────────────────────────
app.get("/admin/revoke",(req,res)=>{
 const master = req.query.master;
 const keyToRevoke = req.query.key;
 if(master !== MASTER_PASSWORD){
  return res.status(403).json({error:"Invalid master password"});
 }
 if(!keyToRevoke){
  return res.status(400).json({error:"Please specify the key parameter to revoke"});
 }
 
 if(AUTHORIZED_KEYS.has(keyToRevoke)) {
   AUTHORIZED_KEYS.delete(keyToRevoke);
   saveKeys();
   res.json({
    success: true,
    message: `Key ${keyToRevoke} has been successfully revoked.`
   });
 } else {
   res.status(404).json({
    success: false,
    message: "Key not found in active list."
   });
 }
});

// ── Protected script endpoint (KEY REQUIRED) ───────────────────
app.get("/script",(req,res)=>{
 const key = req.headers["x-license-key"] || req.query.key;

 if(!key){
  return res.status(401).json({error:"License key required"});
 }

 if(!AUTHORIZED_KEYS.has(key)){
  console.log(`[UNAUTHORIZED] Key: ${key} | IP: ${req.ip}`);
  return res.status(403).json({error:"Unauthorized — invalid license key"});
 }

 try{
  const scriptPath=path.join(__dirname,"app.js");
  const script=fs.readFileSync(scriptPath,"utf8");

  const randomId=Math.random().toString(36).substring(7);
  const protectedScript=`//ID:${randomId}\n${script}`;

  console.log(`[AUTHORIZED] Key: ${key} | IP: ${req.ip}`);
  res.type("text/javascript");
  res.send(protectedScript);
 }catch(err){
  res.status(500).json({error:"Script not found"});
 }
});

const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{
 console.log("CLEAR BOOST SERVER RUNNING");
});