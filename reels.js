// Modernized reels.js with CS2-style animation, sounds, max bet and balance check
const SYMBOLS = ['🍋','🍓','🍊','🔔','⭐','BAR','7','🍀'];
const PAYTABLE = {'🍋':50,'🍓':100,'🍊':80,'🔔':200,'⭐':500,'BAR':2000,'7':5000,'🍀':150};
const FREE_SPINS = 20;
const DEFAULT_BET = 500;
const MAX_BET = 100000000;

// Progressive jackpots
function loadJPs(){
  const raw = localStorage.getItem('neon_jp');
  if(raw) return JSON.parse(raw);
  const jp = {mini:1000, major:5000, mega:20000};
  localStorage.setItem('neon_jp', JSON.stringify(jp));
  return jp;
}
function saveJPs(jp){ localStorage.setItem('neon_jp', JSON.stringify(jp)); }
let jackpots = loadJPs();

function currency(n){ return Number(n).toLocaleString('ru-RU'); }

// User data
function currentUser(){ return localStorage.getItem('neon_logged') || null; }
function getUserData(email){ const users = JSON.parse(localStorage.getItem('neon_users')||'{}'); return users[email]; }
function saveUserData(email, data){ const users = JSON.parse(localStorage.getItem('neon_users')||'{}'); users[email]=data; localStorage.setItem('neon_users', JSON.stringify(users)); }
function addHistory(email, entry){ const data = getUserData(email); if(!data) return; data.history = data.history||[]; data.history.unshift(entry); saveUserData(email,data); }

let state = {spins:FREE_SPINS, balance:0};
const balEl = document.getElementById('bal');
const freeEl = document.getElementById('freeSpins');
const userEmailEl = document.getElementById('userEmail');
const jpMini = document.getElementById('jpMini');
const jpMajor = document.getElementById('jpMajor');
const jpMega = document.getElementById('jpMega');
const spinBtn = document.getElementById('spinBtn');
const autoBtn = document.getElementById('autoplayBtn');
const betInput = document.getElementById('betInput');
const lastResult = document.getElementById('lastResult');
const reelEls = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];

// Audio effects
const soundSpin = new Audio('sounds/spin.mp3');
const soundWin = new Audio('sounds/win.mp3');
const soundJackpot = new Audio('sounds/jackpot.mp3');

function init(){
  renderJPs();
  const user = currentUser();
  if(user){
    const data = getUserData(user);
    state.balance = data.balance || 0;
    state.spins = data.spins==null?FREE_SPINS:data.spins;
    userEmailEl.textContent = user;
    document.getElementById('openAuth').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
  } else {
    const sess = sessionStorage.getItem('neon_session');
    if(sess) state = JSON.parse(sess);
    else { state = {spins:FREE_SPINS, balance:0}; sessionStorage.setItem('neon_session', JSON.stringify(state)); }
  }
  renderState();
}

function renderJPs(){ jpMini.textContent = currency(jackpots.mini); jpMajor.textContent = currency(jackpots.major); jpMega.textContent = currency(jackpots.mega); }
function renderState(){ balEl.textContent = currency(state.balance); freeEl.textContent = state.spins; }

let spinning=false;
function spin(){
  if(spinning) return;
  let bet = Number(betInput.value||DEFAULT_BET);
  bet = Math.min(bet, MAX_BET);

  if(state.spins <= 0 && bet > state.balance){ alert('Недостаточно средств для этой ставки'); return; }

  spinning = true;
  soundSpin.currentTime = 0; soundSpin.play();

  if(state.spins>0){ state.spins--; } else { state.balance -= bet; }
  jackpots.mini += Math.floor(bet*0.02);
  jackpots.major += Math.floor(bet*0.01);
  jackpots.mega += Math.floor(bet*0.005);
  saveJPs(jackpots); renderJPs();

  const results = [randSym(), randSym(), randSym()];
  const strips = reelEls.map(el => makeStrip(results[reelEls.indexOf(el)]));
  reelEls.forEach((el, idx)=>{
    el.innerHTML = '';
    el.appendChild(strips[idx]);
    const strip = strips[idx];
    strip.style.transform = 'translateY(-900px)';
    setTimeout(()=>{
      strip.style.transition = 'transform 1200ms cubic-bezier(.2,.9,.3,1)';
      strip.style.transform = 'translateY(0)';
    }, idx*120);
  });

  setTimeout(()=>{
    const [a,b,c] = results;
    let payout = computePayout(a,b,c, bet);
    let message = 'Увы, ничего не выпало';

    if(payout>0){
      state.balance = Math.min(state.balance + payout, 1e9);
      message = 'Выигрыш: ' + currency(payout) + ' ₽';
      soundWin.play();
      if(currentUser()) addHistory(currentUser(), {when:Date.now(), amount:payout, symbols:[a,b,c]});
    } else {
      const jpHit = checkJackpotHit(bet);
      if(jpHit){
        const jpAmount = jackpots[jpHit];
        state.balance = Math.min(state.balance + jpAmount, 1e9);
        message = 'ДЖЕКПОТ ' + jpHit.toUpperCase() + '! Выплата: ' + currency(jpAmount) + ' ₽';
        soundJackpot.play();
        if(jpHit==='mini') jackpots.mini = 1000;
        if(jpHit==='major') jackpots.major = 5000;
        if(jpHit==='mega') jackpots.mega = 20000;
        saveJPs(jackpots); renderJPs();
        if(currentUser()) addHistory(currentUser(), {when:Date.now(), amount:jpAmount, jackpot:jpHit});
      }
    }

    if(currentUser()){
      const data = getUserData(currentUser());
      data.balance = state.balance; data.spins = state.spins; saveUserData(currentUser(), data);
    } else { sessionStorage.setItem('neon_session', JSON.stringify(state)); }

    lastResult.textContent = message;
    renderState();
    spinning=false;
  }, 1600);
}

function randSym(){ return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]; }

function makeStrip(finalSymbol){
  const strip = document.createElement('div'); strip.className='strip';
  for(let i=0;i<12;i++){
    const s = document.createElement('div'); s.className='sym'; s.textContent = SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
    strip.appendChild(s);
  }
  const f = document.createElement('div'); f.className='sym'; f.textContent = finalSymbol;
  f.style.background='linear-gradient(90deg,#ff6bff,#00f0ff)';
  f.style.color='#000'; f.style.fontSize='42px';
  strip.appendChild(f);
  return strip;
}

function computePayout(a,b,c, bet){
  if(a===b && b===c){ const base = PAYTABLE[a] || 50; return base * 3 * Math.max(1, Math.floor(bet/DEFAULT_BET)); }
  if(a===b || b===c || a===c){ const sym = a===b? a : (b===c? b : a); const base = PAYTABLE[sym] || 20; return Math.floor(base * Math.max(1, Math.floor(bet/DEFAULT_BET))); }
  return 0;
}

function checkJackpotHit(bet){
  const r = Math.random();
  const chanceMega = 0.0005 * (bet/DEFAULT_BET);
  const chanceMajor = 0.002 * (bet/DEFAULT_BET);
  const chanceMini = 0.01 * (bet/DEFAULT_BET);
  if(r < chanceMega) return 'mega';
  if(r < chanceMajor+chanceMega) return 'major';
  if(r < chanceMini+chanceMajor+chanceMega) return 'mini';
  return null;
}

let autoCount=0; let autoInterval=null;
function startAuto(n=10){
  if(autoInterval) return;
  autoCount = n;
  autoInterval = setInterval(()=>{ if(autoCount<=0){ clearInterval(autoInterval); autoInterval=null; return; } spin(); autoCount--; }, 1800);
}

document.getElementById('spinBtn').addEventListener('click', ()=> spin());
document.getElementById('autoplayBtn').addEventListener('click', ()=> startAuto(10));
document.getElementById('openAuth').addEventListener('click', ()=> Auth.openModal());
document.getElementById('logoutBtn').addEventListener('click', ()=> { localStorage.removeItem('neon_logged'); location.reload(); });

init();
