// Local auth for demo + Firebase placeholder for Google
(function(){
  const modal = document.getElementById('authModal');
  const closeBtn = document.getElementById('closeAuth');
  const primary = document.getElementById('authPrimary');
  const switchReg = document.getElementById('switchToRegister');
  const googleBtn = document.getElementById('googleBtn');
  const authMsg = document.getElementById('authMsg');
  const authTitle = document.getElementById('authTitle');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  let mode='login';
  closeBtn.addEventListener('click', ()=> { modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); });
  window.Auth = {
    openModal: (m='login')=>{ mode=m; authTitle.textContent = m==='login'?'Вход':'Регистрация'; authMsg.textContent=''; primary.textContent = m==='login'?'Войти':'Зарегистрироваться'; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); },
    isLoggedIn: ()=> !!localStorage.getItem('neon_logged'),
    currentUserEmail: ()=> localStorage.getItem('neon_logged')||null,
    getBalance: ()=> { const u=localStorage.getItem('neon_logged'); if(!u) return 0; const d = JSON.parse(localStorage.getItem('neon_users')||'{}'); return (d[u] && d[u].balance) || 0; },
    addBalance: (amt)=> { const u=localStorage.getItem('neon_logged'); if(!u) return; const d = JSON.parse(localStorage.getItem('neon_users')||'{}'); d[u].balance = (d[u].balance||0)+amt; d[u].history = d[u].history||[]; d[u].history.unshift({when: Date.now(), amount:amt}); localStorage.setItem('neon_users', JSON.stringify(d)); }
  };
  primary.addEventListener('click', ()=>{
    const email = emailInput.value.trim().toLowerCase();
    const pass = passInput.value;
    if(!email || !pass) { authMsg.style.color='red'; authMsg.textContent='Введите email и пароль'; return; }
    const users = JSON.parse(localStorage.getItem('neon_users')||'{}');
    if(mode==='login'){
      if(users[email] && users[email].pass === pass){
        localStorage.setItem('neon_logged', email);
        modal.classList.add('hidden');
        window.dispatchEvent(new Event('auth:loggedin'));
        location.reload();
      } else { authMsg.style.color='red'; authMsg.textContent='Неверный логин или пароль'; }
    } else {
      if(users[email]){ authMsg.style.color='red'; authMsg.textContent='Пользователь уже существует'; return; }
      users[email] = {pass:pass, balance:0, spins:20, history:[]};
      localStorage.setItem('neon_users', JSON.stringify(users));
      localStorage.setItem('neon_logged', email);
      modal.classList.add('hidden');
      window.dispatchEvent(new Event('auth:loggedin'));
      location.reload();
    }
  });
  switchReg.addEventListener('click', ()=> { Auth.openModal(mode==='login'?'register':'login'); });
  googleBtn.addEventListener('click', ()=> { alert('Google Sign-In: для работы включите Firebase и установите USE_FIREBASE в auth.js (см. README)'); });
})();