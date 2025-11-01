(() => {
  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(btn.dataset.target).classList.add('active');
      // Evento personalizado para que otros módulos reaccionen
      document.dispatchEvent(new CustomEvent('tab:changed', { detail: btn.dataset.target }));
    });
  });

  // Helper global simple
  window.pretty = (obj) => JSON.stringify(obj, null, 2);
})();
