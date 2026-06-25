(function () {
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }
})();

(function () {
  const navbar = document.getElementById('navbar');

  function updateNavbarShadow() {
    if (!navbar) return;
    navbar.style.boxShadow =
      window.scrollY > 30 ? '0 20px 40px rgba(0, 0, 0, 0.25)' : 'none';
  }

  window.addEventListener('scroll', updateNavbarShadow, { passive: true });
  updateNavbarShadow();
})();

(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav-links');

  if (!btn || !nav) return;

  function openMenu() {
    btn.classList.add('open');
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Chiudi il menu');
  }

  function closeMenu() {
    btn.classList.remove('open');
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Apri il menu');
  }

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
})();

(function () {
  const previewButtons = document.querySelectorAll('.btn-preview-toggle');

  previewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const dropdown = button.nextElementSibling;
      const isOpen = dropdown.classList.contains('open');

      dropdown.classList.toggle('open');
      button.setAttribute('aria-expanded', String(!isOpen));
      button.textContent = isOpen ? 'Mostra anteprima' : 'Nascondi anteprima';
    });
  });
})();

/* EFFETTO 3D — il laptop segue il cursore del mouse */
(function () {
  const scene = document.querySelector('.laptop-scene');
  const laptop = document.querySelector('.laptop');

  if (!scene || !laptop) return;

  /* Rotazione base del laptop senza mouse */
  const baseX = 18;
  const baseY = -18;

  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();

    /* Calcolo posizione relativa del mouse nel contenitore
       da -1 a +1 su entrambi gli assi */
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    /* Applico rotazione aggiuntiva in base al cursore
       max ±10 gradi extra rispetto alla base */
    const rotX = baseX - y * 10;
    const rotY = baseY + x * 10;

    laptop.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  /* Quando il cursore esce torno alla rotazione base */
  scene.addEventListener('mouseleave', () => {
    laptop.style.transform = `rotateX(${baseX}deg) rotateY(${baseY}deg)`;
  });
})();