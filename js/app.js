const API="/api";const LOCAL="feedback_local";let rating=0;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function view(id){$$(".view").forEach(x=>x.classList.toggle("active",x.id===id));$$("nav button").forEach(x=>x.classList.toggle("active",x.dataset.view===id));if(id==="overview")load();scrollTo(0,0)}
document.addEventListener("click",e=>{let x=e.target.closest("[data-view]");if(x){e.preventDefault();view(x.dataset.view)}});

function stars(){let box=$("#stars");box.innerHTML="";for(let i=1;i<=5;i++){let b=document.createElement("button");b.type="button";b.textContent="☆";b.onclick=()=>{rating=i;paintStars()};box.appendChild(b)}}function paintStars(){$$("#stars button").forEach((b,i)=>b.textContent=i<rating?"★":"☆")}stars();

function localData(){return JSON.parse(localStorage.getItem(LOCAL)||"[]")}function saveLocal(x){let d=localData();d.unshift(x);localStorage.setItem(LOCAL,JSON.stringify(d))}
async function post(item){try{let r=await fetch(API+"/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});if(!r.ok)throw 0;return}catch(e){saveLocal(item)}}
async function getData(){try{let r=await fetch(API+"/feedback");if(!r.ok)throw 0;return await r.json()}catch(e){return localData()}}

function clear(){["name","class","subject","rating"].forEach(id=>{let f=$("#f-"+id);if(f){f.classList.remove("bad");f.querySelector(".msg")?.remove()}});$("#error").classList.add("hidden")}
function bad(id,msg){let f=$("#f-"+id);f.classList.add("bad");let p=document.createElement("div");p.className="msg";p.textContent="ⓘ "+msg;f.appendChild(p)}
$("#feedback").onsubmit=async e=>{e.preventDefault();clear();let ok=true;if(!$("#name").value.trim()){bad("name","Palun sisesta oma nimi.");ok=false}if(!/^[A-Za-z0-9À-ž][A-Za-z0-9À-ž ._-]{0,29}$/.test($("#class").value.trim())){bad("class","Palun sisesta kehtiv klass.");ok=false}if(!$("#subject").value){bad("subject","Palun vali õppeaine.");ok=false}if(!rating){bad("rating","Palun anna hinnang (1–5).");ok=false}if(!ok){$("#error").classList.remove("hidden");return}let d=new Date();await post({id:Date.now().toString(),name:$("#name").value.trim(),className:$("#class").value.trim().toUpperCase(),subject:$("#subject").value,rating,comment:$("#comment").value.trim(),date:d.toLocaleDateString("et-EE"),createdAt:d.toISOString()});$("#feedback").reset();rating=0;paintStars();view("success")};

function esc(v){return String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
async function load(){
  let d=await getData();
  d=d.map(x=>({
    ...x,
    subject:x.subject||"—",
    name:x.name||x.student||"—",
    className:x.className||x.class||"—",
    rating:Number(x.rating)||0,
    comment:x.comment||"",
    date:x.date||new Date(x.createdAt||Date.now()).toLocaleDateString("et-EE")
  }));
  $("#total").textContent=d.length;
  $("#avg").textContent=d.length?(d.reduce((a,x)=>a+x.rating,0)/d.length).toFixed(1):"0.0";
  let m={};
  d.forEach(x=>(m[x.subject]??=[]).push(x.rating));
  let s=Object.entries(m).map(([subject,a])=>({subject,n:a.length,avg:a.reduce((x,y)=>x+y,0)/a.length}));
  $("#count").textContent=s.length;
  $("#subjects").innerHTML=s.length?s.map(x=>`<tr><td>${esc(x.subject)}</td><td>${x.n}</td><td><b>${x.avg.toFixed(1)}</b></td></tr>`).join(""):"<tr><td colspan="3">Tagasisideid veel ei ole.</td></tr>";
  $("#bars").innerHTML=s.map(x=>`<div class="baritem"><div class="barvalue">${x.avg.toFixed(1)}</div><div class="bar" style="height:${x.avg/5*160}px"></div><span>${esc(x.subject)}</span></div>`).join("");
  $("#feedbackRows").innerHTML=d.length?d.slice(0,20).map(x=>`<tr><td><b>${esc(x.subject)}</b></td><td>${esc(x.name)}</td><td>${esc(x.className)}</td><td><span class="stars-cell">${"★".repeat(Math.min(5,x.rating))}${"☆".repeat(Math.max(0,5-x.rating))}</span><span class="rating-number"> ${x.rating}/5</span></td><td>${esc(x.comment)||"—"}</td><td>${esc(x.date)}</td></tr>`).join(""):"<tr><td colspan="6">Tagasisideid veel ei ole.</td></tr>";
}
load();