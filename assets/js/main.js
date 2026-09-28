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


/* ===== VIAGGIO TRA LE COMPETENZE — animazione canvas =====
   Un impulso luminoso attraversa da solo i nodi (le mie competenze).
   Passando il mouse o toccando un nodo, l'animazione si ferma
   qualche secondo su quel nodo e ne mostra la descrizione. */
(function () {
  const canvas = document.getElementById('journey-canvas');
  const caption = document.getElementById('journey-caption');
  if (!canvas || !caption) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ACCENT = '100, 216, 255';
  const HOLD_MS = 4000;      // quanto resta fermo sul nodo scelto dall'utente
  const PULSE_SPEED = 0.008; // velocità dell'impulso lungo un tratto

  // Coordinate relative (0-1): disposizione a zigzag per non sovrapporre le etichette
  const nodes = [
    { label: 'HTML/CSS',   x: 0.10, y: 0.68, text: 'Siti responsive, landing page e questo portfolio: layout, gerarchia e animazioni CSS.' },
    { label: 'JavaScript', x: 0.27, y: 0.30, text: 'L\u2019interattività dei miei siti: animazioni, scroll-reveal e comportamento dell\u2019interfaccia.' },
    { label: 'Python',     x: 0.44, y: 0.70, text: 'Il linguaggio di Azienda Finder e del corso Udemy che ho completato a settembre 2026.' },
    { label: 'Flask',      x: 0.61, y: 0.28, text: 'Il back-end di Azienda Finder, con endpoint REST per ricerca, archivio ed esportazione.' },
    { label: 'API',        x: 0.77, y: 0.68, text: 'Google Places e OpenStreetMap in Azienda Finder, con controllo delle chiamate per limitare i costi; nel corso Python anche le API di OpenAI.' },
    { label: 'IA',         x: 0.91, y: 0.32, text: 'Il campo che sto esplorando per capire come sfruttarla in progetti futuri.' }
  ];
  const extraLinks = [[0, 2], [1, 3], [2, 4], [3, 5]];

  let w = 0, h = 0;
  let current = 0;          // nodo di partenza del tratto in corso
  let progress = 0;         // 0-1 lungo il tratto
  let focusIdx = null;      // nodo scelto dall'utente
  let focusUntil = 0;
  let pointerInside = false;
  const pointer = { x: -999, y: -999 };
  const glow = nodes.map(() => 0);
  let shownIdx = -1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  function position(n, i, time) {
    const float = reduceMotion ? 0 : 1;
    return {
      x: n.x * w + Math.sin(time / 1400 + i * 1.3) * 4 * float,
      y: n.y * h + Math.cos(time / 1700 + i * 1.3) * 4 * float
    };
  }

  function nearestNode(pos, maxDist) {
    let best = null, bestDist = maxDist;
    pos.forEach((p, i) => {
      const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
      if (d < bestDist) { best = i; bestDist = d; }
    });
    return best;
  }

  function setPointer(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  }

  canvas.addEventListener('pointermove', (e) => { pointerInside = true; setPointer(e); });
  canvas.addEventListener('pointerleave', () => { pointerInside = false; pointer.x = pointer.y = -999; });
  canvas.addEventListener('pointerdown', (e) => {
    setPointer(e);
    const pos = nodes.map((n, i) => position(n, i, performance.now()));
    const hit = nearestNode(pos, 34);
    if (hit !== null) {
      focusIdx = hit;
      focusUntil = performance.now() + HOLD_MS;
      glow[hit] = 1;
    }
  });

  function showCaption(idx) {
    if (idx === shownIdx) return;
    shownIdx = idx;
    caption.innerHTML = '';
    const title = document.createElement('strong');
    title.textContent = nodes[idx].label;
    caption.appendChild(title);
    caption.appendChild(document.createTextNode(nodes[idx].text));
  }

  function frame(time) {
    requestAnimationFrame(frame);
    if (!w || canvas.offsetParent === null) return; // pannello nascosto: niente disegno

    ctx.clearRect(0, 0, w, h);
    const pos = nodes.map((n, i) => position(n, i, time));

    // Nodo in evidenza: hover del mouse > scelta recente > impulso automatico
    const hovered = pointerInside ? nearestNode(pos, 26) : null;
    if (hovered !== null) { focusIdx = hovered; focusUntil = time + HOLD_MS; }
    const userFocus = focusIdx !== null && time < focusUntil;
    if (!userFocus) focusIdx = null;

    // Avanzamento impulso (fermo se l'utente sta guardando un nodo o se movimento ridotto)
    if (!userFocus && !reduceMotion) {
      progress += PULSE_SPEED;
      if (progress >= 1) {
        progress = 0;
        current = current + 1 >= nodes.length - 1 ? 0 : current + 1;
        glow[current] = 1;
      }
    }
    const active = userFocus ? focusIdx : current;
    showCaption(active);

    // Collegamenti secondari (deboli) e principali
    ctx.lineWidth = 1;
    extraLinks.forEach(([a, b]) => {
      ctx.strokeStyle = 'rgba(' + ACCENT + ', 0.10)';
      ctx.beginPath(); ctx.moveTo(pos[a].x, pos[a].y); ctx.lineTo(pos[b].x, pos[b].y); ctx.stroke();
    });
    for (let i = 0; i < nodes.length - 1; i++) {
      ctx.strokeStyle = 'rgba(' + ACCENT + ', 0.32)';
      ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[i + 1].x, pos[i + 1].y); ctx.stroke();
    }

    // Impulso luminoso
    if (!userFocus) {
      const a = pos[current], b = pos[current + 1];
      const px = a.x + (b.x - a.x) * progress;
      const py = a.y + (b.y - a.y) * progress;
      ctx.fillStyle = 'rgba(' + ACCENT + ', 0.25)';
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    // Nodi ed etichette
    nodes.forEach((n, i) => {
      glow[i] *= 0.96;
      const on = i === active && (userFocus || glow[i] > 0.05);
      const g = userFocus && i === active ? 1 : glow[i];
      const p = pos[i];
      if (g > 0.05) {
        ctx.fillStyle = 'rgba(' + ACCENT + ', ' + (g * 0.3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, 7 + g * 9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = on ? '#ffffff' : 'rgb(' + ACCENT + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();

      ctx.font = (on ? '600 13px' : '12px') + ' Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = on ? '#ffffff' : 'rgba(232, 238, 248, 0.72)';
      ctx.fillText(n.label, p.x, p.y + (n.y < 0.5 ? -14 : 22));
    });
  }

  requestAnimationFrame(frame);
})();