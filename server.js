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
app.get("/",(req,res)=>{
 res.send("CLEAR BOOST SERVER ACTIVE");
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