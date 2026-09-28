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
   Un impulso luminoso attraversa da solo i nodi (le mie competenze)
   e, dopo l'ultimo, ritorna al primo lungo un arco curvo: il percorso
   è un anello continuo, senza salti. Passando il mouse o toccando un
   nodo, l'animazione si ferma qualche secondo e ne mostra la descrizione. */
(function () {
  const canvas = document.getElementById('journey-canvas');
  const caption = document.getElementById('journey-caption');
  if (!canvas || !caption) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ACCENT = '100, 216, 255';
  const HOLD_MS = 4000;   // quanto resta fermo sul nodo scelto dall'utente
  const SPEED = 0.07;     // velocità dell'impulso in pixel per millisecondo

  // Coordinate relative (0-1): zigzag per non sovrapporre le etichette.
  // "above" forza l'etichetta sopra il nodo (serve al primo e all'ultimo, sotto passa l'arco di ritorno).
  const nodes = [
    { label: 'Java',       x: 0.09,  y: 0.68, above: true, text: 'Il linguaggio dei miei studi: programmazione a oggetti e programmazione avanzata all\u2019università.' },
    { label: 'HTML/CSS',   x: 0.225, y: 0.30, text: 'Siti responsive, landing page e questo portfolio: layout, gerarchia e animazioni CSS.' },
    { label: 'JavaScript', x: 0.36,  y: 0.70, text: 'L\u2019interattività dei miei siti: animazioni, scroll-reveal e comportamento dell\u2019interfaccia.' },
    { label: 'Python',     x: 0.495, y: 0.28, text: 'Il linguaggio di Azienda Finder e del corso Udemy che ho completato a settembre 2026.' },
    { label: 'Flask',      x: 0.63,  y: 0.68, text: 'Il back-end di Azienda Finder, con endpoint REST per ricerca, archivio ed esportazione.' },
    { label: 'API',        x: 0.765, y: 0.30, text: 'Google Places e OpenStreetMap in Azienda Finder, con controllo delle chiamate per limitare i costi; nel corso Python anche le API di OpenAI.' },
    { label: 'IA',         x: 0.91,  y: 0.68, above: true, text: 'Il campo che sto esplorando per capire come sfruttarla in progetti futuri.' }
  ];
  const extraLinks = [[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]];
  const N = nodes.length;

  let w = 0, h = 0;
  let current = 0;          // nodo di partenza del tratto in corso (l'ultimo tratto è l'arco N-1 -> 0)
  let progress = 0;         // 0-1 lungo il tratto
  let lastTime = 0;
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

  // Un tratto del percorso: retta tra due nodi, oppure (ultimo) arco curvo che torna al primo.
  function segment(i, pos) {
    if (i < N - 1) {
      const a = pos[i], b = pos[i + 1];
      return {
        len: Math.hypot(b.x - a.x, b.y - a.y),
        pt: (t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
      };
    }
    const a = pos[N - 1], b = pos[0];
    const c = { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + h * 0.42 };
    const pt = (t) => {
      const u = 1 - t;
      return {
        x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
        y: u * u * a.y + 2 * u * t * c.y + t * t * b.y
      };
    };
    let len = 0, prev = pt(0);
    for (let k = 1; k <= 16; k++) {
      const q = pt(k / 16);
      len += Math.hypot(q.x - prev.x, q.y - prev.y);
      prev = q;
    }
    return { len, pt, a, b, c };
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
    if (!w || canvas.offsetParent === null) { lastTime = time; return; } // pannello nascosto

    const dt = Math.min(time - lastTime, 50);
    lastTime = time;

    ctx.clearRect(0, 0, w, h);
    const pos = nodes.map((n, i) => position(n, i, time));

    // Nodo in evidenza: hover del mouse > scelta recente > impulso automatico
    const hovered = pointerInside ? nearestNode(pos, 26) : null;
    if (hovered !== null) { focusIdx = hovered; focusUntil = time + HOLD_MS; }
    const userFocus = focusIdx !== null && time < focusUntil;
    if (!userFocus) focusIdx = null;

    const seg = segment(current, pos);

    // Avanzamento a velocità costante in pixel: nessuno scatto tra tratti di lunghezza diversa
    if (!userFocus && !reduceMotion) {
      progress += (SPEED * dt) / seg.len;
      if (progress >= 1) {
        progress = 0;
        current = (current + 1) % N;
        glow[current] = 1;
      }
    }

    // Durante l'arco di ritorno, a metà strada la descrizione passa al primo nodo
    const autoIdx = (current === N - 1 && progress > 0.5) ? 0 : current;
    const active = userFocus ? focusIdx : autoIdx;
    showCaption(active);

    // Collegamenti secondari (deboli)
    ctx.lineWidth = 1;
    extraLinks.forEach(([a, b]) => {
      ctx.strokeStyle = 'rgba(' + ACCENT + ', 0.10)';
      ctx.beginPath(); ctx.moveTo(pos[a].x, pos[a].y); ctx.lineTo(pos[b].x, pos[b].y); ctx.stroke();
    });

    // Percorso principale + arco di ritorno
    ctx.strokeStyle = 'rgba(' + ACCENT + ', 0.32)';
    for (let i = 0; i < N - 1; i++) {
      ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[i + 1].x, pos[i + 1].y); ctx.stroke();
    }
    const arc = segment(N - 1, pos);
    ctx.beginPath();
    ctx.moveTo(arc.a.x, arc.a.y);
    ctx.quadraticCurveTo(arc.c.x, arc.c.y, arc.b.x, arc.b.y);
    ctx.stroke();

    // Impulso luminoso con una piccola scia
    if (!userFocus) {
      for (let k = 5; k >= 1; k--) {
        const tt = progress - (k * 7) / seg.len;
        if (tt < 0) continue;
        const q = seg.pt(tt);
        ctx.fillStyle = 'rgba(' + ACCENT + ', ' + (0.42 - k * 0.07) + ')';
        ctx.beginPath(); ctx.arc(q.x, q.y, 3.6 - k * 0.4, 0, Math.PI * 2); ctx.fill();
      }
      const p = seg.pt(progress);
      ctx.fillStyle = 'rgba(' + ACCENT + ', 0.25)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
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

      const above = n.above !== undefined ? n.above : n.y < 0.5;
      ctx.font = (on ? '600 13px' : '12px') + ' Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = on ? '#ffffff' : 'rgba(232, 238, 248, 0.72)';
      ctx.fillText(n.label, p.x, p.y + (above ? -14 : 22));
    });
  }

  requestAnimationFrame(frame);
})();


/* ===== CORRENTE DI SFONDO — filamenti di luce dietro a tutta la pagina =====
   Linee sottili e ondulate scorrono lente in orizzontale, come un'aurora
   dietro al contenuto. Molto tenue, per non disturbare la lettura. */
(function () {
  const canvas = document.getElementById('route-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ACCENT = '100, 216, 255';
  let w = 0, h = 0, lines = [], t = 0, lastTime = 0;

  function layout() {
    w = window.innerWidth;
    h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(7, Math.round(h / 95));
    lines = [];
    for (let i = 0; i < count; i++) {
      lines.push({
        y: ((i + 0.5) / count) * h + (Math.random() - 0.5) * 40,
        amp: 22 + Math.random() * 30,
        len: w * (0.34 + Math.random() * 0.24),
        speed: 0.055 + Math.random() * 0.07,
        off: (i / count) * (w + w * 1.2) + Math.random() * 200,
        alpha: 0.14 + Math.random() * 0.12,
        wl: 90 + Math.random() * 70
      });
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });
  layout();

  function frame(time) {
    requestAnimationFrame(frame);
    if (document.hidden || !w) { lastTime = time; return; }
    const dt = Math.min(time - lastTime, 50);
    lastTime = time;
    if (!reduceMotion) t += dt;

    ctx.clearRect(0, 0, w, h);

    lines.forEach((ln) => {
      const startX = ((t * ln.speed + ln.off) % (w + ln.len * 1.4)) - ln.len * 0.7;
      ctx.beginPath();
      for (let px = 0; px <= ln.len; px += 6) {
        const x = startX + px;
        const y = ln.y + Math.sin((px + t * ln.speed * 1.4) / ln.wl) * ln.amp;
        px === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(startX, 0, startX + ln.len, 0);
      grad.addColorStop(0, 'rgba(' + ACCENT + ', 0)');
      grad.addColorStop(0.5, 'rgba(' + ACCENT + ', ' + ln.alpha + ')');
      grad.addColorStop(1, 'rgba(' + ACCENT + ', 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    });
  }

  requestAnimationFrame(frame);
})();