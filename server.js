const express=require("express");
const path=require("path");

const app=express();

const TOKENS={
 "sha_token":"USER1",
 "vip_token":"USER2"
};

app.get("/script",(req,res)=>{

 const auth=
 req.headers.authorization;

 if(!auth){
  return res.status(403)
  .send("ACCESS DENIED");
 }

 const token=
 auth.replace("Bearer ","");

 if(!TOKENS[token]){
  return res.status(403)
  .send("INVALID TOKEN");
 }

 console.log(
 "AUTHORIZED:",
 TOKENS[token]
 );

 res.sendFile(
 path.join(__dirname,"app.js")
 );

});

app.listen(3000,()=>{
 console.log("RUNNING");
});