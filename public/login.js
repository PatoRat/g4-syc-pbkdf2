(() => {
  const form = document.getElementById('loginForm');
  const out  = document.getElementById('loginOutput');
  const stat = document.getElementById('loginStatus');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    stat.textContent = 'Procesando...';
    out.textContent = '';

    try {
      const F = new FormData(form);
      const body = { user: F.get('user'), password: F.get('password') };

      const resp = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await resp.json();
      out.textContent = window.pretty(data);
      stat.textContent = resp.ok ? '✓ Listo' : '✗ Error';
      stat.className = 'status ' + (resp.ok ? 'ok' : 'err');
    } catch (err) {
      stat.textContent = '✗ Error';
      stat.className = 'status err';
      out.textContent = err?.message || String(err);
    }
  });
})();
