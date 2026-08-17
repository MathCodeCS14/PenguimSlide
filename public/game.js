const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
const menu=document.getElementById("menu"),game=document.getElementById("game"),over=document.getElementById("over");
const play=document.getElementById("play"),again=document.getElementById("again"),back=document.getElementById("back");
const distEl=document.getElementById("distance"),fishEl=document.getElementById("fish"),timerEl=document.getElementById("timer");
const finalDist=document.getElementById("finalDistance"),finalFish=document.getElementById("finalFish"),finalTime=document.getElementById("finalTime"),menuRecord=document.getElementById("menuRecord"),newRecord=document.getElementById("newRecord"),nearEl=document.getElementById("near"),speedBar=document.getElementById("speedBar");
let W=innerWidth,H=innerHeight,dpr=devicePixelRatio||1,running=false,last=0,elapsed=0,distance=0,fish=0,high=0;
let playerX=0,playerVX=0,targetX=0,speed=0,obstacles=[],particles=[],snow=[],keys={};
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener("resize",resize);resize();
async function loadHigh(){try{high=(await (await fetch("/api/highscore")).json()).highScore||0}catch{}menuRecord.textContent=high+" m"}loadHigh();
function screen(s){[menu,game,over].forEach(x=>x.classList.remove("active"));s.classList.add("active")}
function start(){screen(game);running=true;last=performance.now();elapsed=0;distance=0;fish=0;speed=300;targetX=0;playerX=0;playerVX=0;obstacles=[];particles=[];snow=[];for(let i=0;i<130;i++)snow.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,a:Math.random()*.6});requestAnimationFrame(loop)}
function end(){if(!running)return;running=false;const score=Math.floor(distance);finalDist.textContent=score+" m";finalFish.textContent=fish;finalTime.textContent=format(elapsed);const nr=score>high;newRecord.classList.toggle("hidden",!nr);if(nr){high=score;fetch("/api/highscore",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({score})}).catch(()=>{});menuRecord.textContent=high+" m"}screen(over)}
function format(s){let m=Math.floor(s/60),q=Math.floor(s%60);return String(m).padStart(2,"0")+":"+String(q).padStart(2,"0")}
function nudge(dir){if(!running)return;targetX+=dir*.085;targetX=Math.max(-.36,Math.min(.36,targetX))}
addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.l=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.r=true});
addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.l=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.r=false});
document.getElementById("left").onpointerdown=()=>nudge(-1);document.getElementById("right").onpointerdown=()=>nudge(1);play.onclick=start;again.onclick=start;back.onclick=()=>{screen(menu);loadHigh()};
function roadX(offset){return W/2+Math.sin((distance+offset)*.00125)*W*.055+Math.sin((distance+offset)*.00043)*W*.035}
function roadWidth(z){return W*(.18+.72*z)}
function spawn(){const x=[.24,.38,.5,.62,.76][Math.floor(Math.random()*5)]+(Math.random()-.5)*.045;obstacles.push({z:.02,x,type:Math.random()<.22?"fish":Math.random()<.48?"rock":"tree",near:false,hit:false})}
function project(o){const z=Math.max(0,Math.min(1,o.z)),p=z*z;return{x:roadX((1-z)*1400)+(o.x-.5)*roadWidth(z),y:H*.27+p*H*.64,s:.25+1.5*z}}
function drawMountain(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#b8e3f2");g.addColorStop(.55,"#eaf8fb");g.addColorStop(1,"#f9fdff");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle="rgba(255,255,255,.5)";for(let i=0;i<12;i++){let y=H*.2+i*H*.07;ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(W*.25,y-25,W*.5,y);ctx.quadraticCurveTo(W*.75,y+25,W,y-5);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill()}}
function drawRoad(){const topY=H*.26,bottomY=H+30,topW=W*.13,bottomW=W*.88,cTop=roadX(1400),cBot=roadX(0),g=ctx.createLinearGradient(0,topY,0,H);g.addColorStop(0,"#f8fdff");g.addColorStop(1,"#d7ebf2");ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cTop-topW,topY);ctx.lineTo(cTop+topW,topY);ctx.lineTo(cBot+bottomW,bottomY);ctx.lineTo(cBot-bottomW,bottomY);ctx.closePath();ctx.fill();ctx.strokeStyle="rgba(126,180,200,.2)";ctx.lineWidth=3;for(let i=0;i<9;i++){let z=i/9,y=topY+z*z*(H*.74),cx=roadX((1-z)*1400),w=roadWidth(z)*.48;ctx.beginPath();ctx.moveTo(cx-w,y);ctx.lineTo(cx+w,y);ctx.stroke()}}
function drawTrees(){for(let i=0;i<14;i++){let z=(i/14+distance*.00016)%1;if(z<.07)continue;let side=i%2?-1:1,p=project({z,x:side>0?.94:.06}),s=p.s*.9;ctx.fillStyle="#8b5b3d";ctx.fillRect(p.x-3*s,p.y-35*s,6*s,35*s);ctx.fillStyle="#155f4b";for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(p.x,p.y-(75-20*k)*s);ctx.lineTo(p.x-28*s,p.y-(25-20*k)*s);ctx.lineTo(p.x+28*s,p.y-(25-20*k)*s);ctx.closePath();ctx.fill()}}}
function drawObject(o){const p=project(o),s=p.s;if(o.type==="fish"){ctx.font=`${30*s}px serif`;ctx.textAlign="center";ctx.fillText("🐟",p.x,p.y)}else if(o.type==="rock"){ctx.fillStyle="#718995";ctx.beginPath();ctx.ellipse(p.x,p.y,22*s,16*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,.4)";ctx.beginPath();ctx.ellipse(p.x-6*s,p.y-6*s,9*s,4*s,-.4,0,Math.PI*2);ctx.fill()}else{ctx.fillStyle="#704c37";ctx.fillRect(p.x-4*s,p.y-45*s,8*s,45*s);ctx.fillStyle="#155d49";for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(p.x,p.y-(85-22*k)*s);ctx.lineTo(p.x-34*s,p.y-(25-22*k)*s);ctx.lineTo(p.x+34*s,p.y-(25-22*k)*s);ctx.closePath();ctx.fill()}}}
function drawPenguin(){
  const x=W/2+playerX*W, y=H*.76;
  const lean=Math.max(-.15,Math.min(.15,playerVX*.016));

  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(lean);

  // Sombra do pinguim no gelo.
  ctx.globalAlpha=.18;
  ctx.fillStyle="#123847";
  ctx.beginPath();
  ctx.ellipse(0,18,58,18,0,0,Math.PI*2);
  ctx.fill();
  ctx.globalAlpha=1;

  // PATAS PRIMEIRO: ficam atrás/por baixo do corpo.
  ctx.fillStyle="#f0a13a";
  ctx.beginPath();
  ctx.ellipse(-22,53,25,9,-.22,0,Math.PI*2);
  ctx.ellipse(22,53,25,9,.22,0,Math.PI*2);
  ctx.fill();

  // Corpo oval azul-escuro. Sem barriga branca.
  const body=ctx.createLinearGradient(0,-58,0,55);
  body.addColorStop(0,"#294a59");
  body.addColorStop(.45,"#172f3b");
  body.addColorStop(1,"#091c26");
  ctx.fillStyle=body;
  ctx.beginPath();
  ctx.ellipse(0,0,40,58,0,0,Math.PI*2);
  ctx.fill();

  // Asas laterais, também escuras.
  ctx.fillStyle="#0d2530";
  ctx.beginPath();
  ctx.ellipse(-39,7,9,30,-.25,0,Math.PI*2);
  ctx.ellipse(39,7,9,30,.25,0,Math.PI*2);
  ctx.fill();

  // Cabeça no topo.
  ctx.fillStyle="#1c3946";
  ctx.beginPath();
  ctx.ellipse(0,-38,30,25,0,0,Math.PI*2);
  ctx.fill();

  // Dois olhos.
  ctx.fillStyle="#fff";
  ctx.beginPath();
  ctx.arc(-11,-43,8,0,Math.PI*2);
  ctx.arc(11,-43,8,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="#101a20";
  ctx.beginPath();
  ctx.arc(-11,-43,3.5,0,Math.PI*2);
  ctx.arc(11,-43,3.5,0,Math.PI*2);
  ctx.fill();

  // Bico triangular laranja no topo.
  ctx.fillStyle="#f2a039";
  ctx.beginPath();
  ctx.moveTo(0,-68);
  ctx.lineTo(-11,-48);
  ctx.lineTo(11,-48);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
function loop(t){if(!running)return;const dt=Math.min(.035,(t-last)/1000);last=t;elapsed+=dt;
if(keys.l)targetX-=dt*.42;if(keys.r)targetX+=dt*.42;targetX=Math.max(-.36,Math.min(.36,targetX));
const accel=(targetX-playerX)*8;playerVX+=(accel-playerVX*4.5)*dt;playerX+=playerVX*dt;
speed=650+Math.min(780,distance*.30);distance+=speed*dt;
if(!obstacles.length||obstacles[obstacles.length-1].z>.34)spawn();
for(let i=obstacles.length-1;i>=0;i--){const o=obstacles[i];o.z+=dt*(speed/1850);const p=project(o),dx=(W/2+playerX*W)-p.x,dy=H*.76-p.y,rad=28+p.s*18;
if(!o.hit&&Math.hypot(dx,dy)<rad){o.hit=true;if(o.type==="fish"){fish++;obstacles.splice(i,1);continue}else{end();return}}
if(!o.near&&o.z>.72&&o.z<.9&&Math.abs(dx)<85&&Math.abs(dx)>rad){o.near=true;nearEl.classList.remove("show");void nearEl.offsetWidth;nearEl.classList.add("show")}
if(o.z>1.08)obstacles.splice(i,1)}
distEl.textContent=Math.floor(distance)+" m";fishEl.textContent=fish;timerEl.textContent=format(elapsed);speedBar.style.width=(15+speed/785*85)+"%";draw();requestAnimationFrame(loop)}
function draw(){drawMountain();drawRoad();drawTrees();for(const o of obstacles)drawObject(o);drawPenguin();for(const s of snow){s.y+=s.s*(1+speed/450);if(s.y>H){s.y=-5;s.x=Math.random()*W}ctx.fillStyle=`rgba(255,255,255,${s.a})`;ctx.fillRect(s.x,s.y,2,2)}}