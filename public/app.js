// Tabs simples
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(btn.dataset.target).classList.add('active');
  });
});

// Helpers
const pretty = (obj) => JSON.stringify(obj, null, 2);

// --- Registro ---
const registerForm = document.getElementById('registerForm');
const registerOutput = document.getElementById('registerOutput');
const registerStatus = document.getElementById('registerStatus');

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerStatus.textContent = 'Procesando...';
  registerOutput.textContent = '';
  try {
    const form = new FormData(registerForm);
    const body = {
      user: form.get('user'),
      password: form.get('password'),
      iterations: Number(form.get('iterations') || 150000),
      prf: form.get('prf') || 'sha256',
      dkLen: Number(form.get('dkLen') || 32),
      saltBytes: Number(form.get('saltBytes') || 16),
    };

    const resp = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    registerOutput.textContent = pretty(data);
    registerStatus.textContent = resp.ok ? '✓ Listo' : '✗ Error';
  } catch (err) {
    registerStatus.textContent = '✗ Error';
    registerOutput.textContent = err?.message || String(err);
  }
});

// --- Login ---
const loginForm = document.getElementById('loginForm');
const loginOutput = document.getElementById('loginOutput');
const loginStatus = document.getElementById('loginStatus');

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginStatus.textContent = 'Procesando...';
  loginOutput.textContent = '';
  try {
    const form = new FormData(loginForm);
    const body = {
      user: form.get('user'),
      password: form.get('password'),
    };

    const resp = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    loginOutput.textContent = pretty(data);
    loginStatus.textContent = resp.ok ? '✓ Listo' : '✗ Error';
  } catch (err) {
    loginStatus.textContent = '✗ Error';
    loginOutput.textContent = err?.message || String(err);
  }
});
