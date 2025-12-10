const symbols = ["🍒","🍋","🔔","⭐","7️⃣"];
const reels = [reel1,reel2,reel3];

function fill(reel){
  reel.innerHTML="";
  for(let i=0;i<15;i++){
    const d=document.createElement("div");
    d.className="sym";
    d.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    reel.appendChild(d);
  }
}

reels.forEach(fill);

spinBtn.onclick = ()=>{
  reels.forEach(reel=>{
    fill(reel);
    reel.style.transition="none";
    reel.style.top="0";
    setTimeout(()=>{
      reel.style.transition="top 1s ease-out";
      reel.style.top="-600px";
    },10);
  });
  lastResult.textContent="Спин!";
};
