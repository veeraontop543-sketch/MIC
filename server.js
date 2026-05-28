const express=require("express");
const path=require("path");

const app=express();

app.get("/",(req,res)=>{
 res.send("CLEAR BOOST");
});

app.get("/script",(req,res)=>{

 res.sendFile(
  path.join(
   __dirname,
   "app.js"
  )
 );

});

const PORT=
process.env.PORT||3000;

app.listen(PORT,()=>{
 console.log("RUNNING");
});