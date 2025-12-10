const SYMBOLS=['🍋','🍓','🍊','🔔','⭐','BAR','7','🍀'];
const PAY={'🍋':50,'🍓':100,'🍊':80,'🔔':200,'⭐':500,'BAR':2000,'7':5000,'🍀':150};
const MAX_BET=100_000_000;
let state={balance:100000,spins:20};

const reels=[
  document.getElementById('reel1'),
  document.getElementById('reel2'),
  document.getElementById('reel3')
];

function rand(){return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];}
function money(n){return n.toLocaleString('ru-RU');}

function makeStrip(final){
  const strip=document.createElement('div');
  strip.className='strip';
  for(let i=0;i<12;i++){
    const d=document.createElement('div');
    d.className='sym'; d.textContent=rand();
    strip.appendChild(d);
  }
  const f=document.createElement('div');
  f.className='sym'; f.textContent=final;
  strip.appendChild(f);
  return strip;
}

function render(){
  bal.textContent=money(state.balance);
  freeSpins.textContent=state.spins;
}

render();

spinBtn.onclick=()=>{
  let bet=+betInput.value;
  if(bet>MAX_BET)return alert('Макс ставка 100 млн');
  if(state.spins<=0 && state.balance<bet)return alert('Нет денег');

  if(state.spins>0)state.spins--;
  else state.balance-=bet;

  const res=[rand(),rand(),rand()];

  reels.forEach((r,i)=>{
    r.classList.remove('win');
    r.innerHTML='';
    const strip=makeStrip(res[i]);
    r.appendChild(strip);
    strip.style.transform='translateY(-900px)';
    strip.style.transition='none';
    setTimeout(()=>{
      strip.style.transition='transform 1200ms cubic-bezier(.2,.9,.3,1)';
      strip.style.transform='translateY(0)';
    },i*120);
  });

  setTimeout(()=>{
    let win=0;
    if(res[0]==res[1]&&res[1]==res[2]){
      win=PAY[res[0]]*Math.max(1,bet/500);
      reels.forEach(r=>r.classList.add('win'));
    }

    if(win){
      state.balance+=win;
      lastResult.textContent='Выигрыш '+money(win)+' ₽';
      if(win>=bet*10)bigWin(win);
    }else lastResult.textContent='Не повезло';

    render();
  },1500);
};

function bigWin(sum){
  const d=document.createElement('div');
  d.className='big-win';
  d.innerHTML=`<h1>BIG WIN<br>${money(sum)} ₽</h1>`;
  document.body.appendChild(d);
  setTimeout(()=>d.remove(),2000);
}
