const express=require("express");
const path=require("path");
const app=express(), PORT=3000;
let highScore=0;
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.get("/api/highscore",(req,res)=>res.json({highScore}));
app.post("/api/highscore",(req,res)=>{
  const score=Number(req.body.score);
  if(Number.isFinite(score)&&score>highScore) highScore=Math.floor(score);
  res.json({highScore});
});
app.use((req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`🐧 Penguin Slide 3.0: http://localhost:${PORT}`));