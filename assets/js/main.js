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