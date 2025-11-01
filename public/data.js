(() => {
    const refreshBtn = document.getElementById('refreshBtn');
    const wipeBtn = document.getElementById('wipeBtn');
    const statusEl = document.getElementById('dataStatus');
    const tbody = document.getElementById('dataTbody');

    if (!tbody) return;

    async function loadFullUsers() {
        statusEl.textContent = 'Cargando...';
        statusEl.className = 'status';
        tbody.innerHTML = '';

        try {
            const resp = await fetch('/users/full');
            const json = await resp.json();
            if (!resp.ok || !json.ok) throw new Error(json.error || 'Error de servidor');

            for (const u of json.users) {
                const tr = document.createElement('tr');
                // Solo las columnas que queremos mostrar
                [
                    u.user,
                    u.salt_hex,
                    u.hash_hex
                ].forEach((val, i) => {
                    const td = document.createElement('td');
                    td.textContent = String(val ?? '');
                    if (i === 2 || i === 3) td.classList.add('mono');
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }

            statusEl.textContent = `✓ ${json.users.length} registro(s)`;
            statusEl.className = 'status ok';
        } catch (e) {
            console.error(e);
            statusEl.textContent = '✗ Error cargando datos';
            statusEl.className = 'status err';
        }
    }


    async function wipeAll() {
        if (!confirm('¿Seguro que querés borrar TODOS los registros?')) return;
        statusEl.textContent = 'Borrando...';
        statusEl.className = 'status';
        try {
            const resp = await fetch('/users', { method: 'DELETE' });
            const json = await resp.json();
            if (!resp.ok || !json.ok) throw new Error(json.error || 'Error de servidor');
            tbody.innerHTML = '';
            statusEl.textContent = '✓ Base vacía';
            statusEl.className = 'status ok';
        } catch (e) {
            console.error(e);
            statusEl.textContent = '✗ Error al borrar';
            statusEl.className = 'status err';
        }
    }

    // Botones
    refreshBtn?.addEventListener('click', loadFullUsers);
    wipeBtn?.addEventListener('click', wipeAll);

    // Cargar cuando se abre la pestaña "Datos"
    document.addEventListener('tab:changed', (ev) => {
        if (ev.detail === '#data') loadFullUsers();
    });

    // Si la pestaña "Datos" viene activa por HTML
    document.addEventListener('DOMContentLoaded', () => {
        const dataPanel = document.querySelector('#data.panel.active');
        if (dataPanel) loadFullUsers();
    });
})();
