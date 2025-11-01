(() => {
  const form = document.getElementById('registerForm');
  const out  = document.getElementById('registerOutput');
  const stat = document.getElementById('registerStatus');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    stat.textContent = 'Procesando...';
    out.textContent = '';

    try {
      const F = new FormData(form);
      const body = {
        user: F.get('user'),
        password: F.get('password'),
        iterations: Number(F.get('iterations') || 150000),
        prf: F.get('prf') || 'sha256',
        dkLen: Number(F.get('dkLen') || 32),
        saltBytes: Number(F.get('saltBytes') || 16),
      };

      const resp = await fetch('/register', {
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
