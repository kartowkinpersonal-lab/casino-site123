const symbols = ["🍒","🍋","💎","7️⃣","⭐"];
const reels = [r1,r2,r3];

function fill(reel){
  reel.innerHTML="";
  for(let i=0;i<20;i++){
    const d=document.createElement("div");
    d.className="sym";
    d.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    reel.appendChild(d);
  }
}

reels.forEach(fill);

spin.onclick=()=>{
  let bet = Number(document.getElementById("bet").value);
  if(bet>100000000) bet=100000000;

  reels.forEach(reel=>{
    fill(reel);
    reel.style.transition="none";
    reel.style.top="0px";
    setTimeout(()=>{
      reel.style.transition="top 1s ease-out";
      reel.style.top="-864px";
    },10);
  });

  result.textContent="Ставка: "+bet.toLocaleString()+" ₽";
};
