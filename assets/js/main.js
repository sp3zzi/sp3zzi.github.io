/* ===================================================
   PORTFOLIO — Andrea Speziari
   File: main.js
=================================================== */

/* ===== TAB NAVIGATION =====
   Sincronizza i bottoni desktop (.tab-btn) e la tab bar
   mobile (.mobile-tab-btn): entrambi mostrano/nascondono
   gli stessi pannelli tramite data-tab / data-panel. */
(function () {
  const desktopTabs = document.querySelectorAll('.tab-btn');
  const mobileTabs = document.querySelectorAll('.mobile-tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  function activateTab(tabName) {
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === tabName);
    });

    desktopTabs.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    mobileTabs.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Rivela gli elementi del pannello appena aperto
    revealActivePanel();

    // Riporta lo scroll in cima quando si cambia sezione
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  [...desktopTabs, ...mobileTabs].forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });
})();


/* ===== REVEAL ON SCROLL / ON TAB CHANGE =====
   Gli elementi .reveal dentro il pannello attivo vengono
   osservati; quando entrano in viewport (o sono già visibili
   perché il pannello è appena stato aperto) prendono .visible */
let revealObserver;

function revealActivePanel() {
  const activePanel = document.querySelector('.tab-panel.active');
  if (!activePanel) return;

  const items = activePanel.querySelectorAll('.reveal:not(.visible)');

  if ('IntersectionObserver' in window) {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14 });
    }
    items.forEach((item) => revealObserver.observe(item));
  } else {
    items.forEach((item) => item.classList.add('visible'));
  }
}

revealActivePanel();


/* ===== PREVIEW DROPDOWN PROGETTI ===== */
(function () {
  const previewButtons = document.querySelectorAll('.btn-preview-toggle');

  previewButtons.forEach((button) => {
    const originalLabel = button.textContent.trim();

    button.addEventListener('click', () => {
      const dropdown = button.nextElementSibling;
      const isOpen = dropdown.classList.contains('open');

      dropdown.classList.toggle('open');
      button.setAttribute('aria-expanded', String(!isOpen));
      button.textContent = isOpen
        ? originalLabel
        : originalLabel.replace('Mostra', 'Nascondi');
    });
  });
})();


/* ===== EFFETTO 3D LAPTOP — segue il cursore del mouse ===== */
(function () {
  const scene = document.querySelector('.laptop-scene');
  const laptop = document.querySelector('.laptop');

  if (!scene || !laptop) return;

  const baseX = 4;
  const baseY = -2;

  laptop.style.transition = 'transform 0.08s ease';

  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const rotX = baseX - y * 6;
    const rotY = baseY + x * 6;

    laptop.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  scene.addEventListener('mouseleave', () => {
    laptop.style.transition = 'transform 0.6s ease';
    laptop.style.transform = `rotateX(${baseX}deg) rotateY(${baseY}deg)`;
  });
})();