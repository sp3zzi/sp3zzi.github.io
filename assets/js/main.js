/* SCROLL REVEAL */
(function() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* NAVBAR SHADOW ALLO SCROLL */
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 170, 255, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
}, { passive: true });

/* TOGGLE PREVIEW DROPDOWN */
function togglePreview(btn) {
    const dropdown = btn.nextElementSibling;
    const isOpen = dropdown.classList.contains('open');
    dropdown.classList.toggle('open');
    btn.textContent = isOpen ? '→ Vedi le preview' : '↑ Chiudi le preview';
}

/* GALLERIA IMMAGINI CARD */
function switchImage(img) {
    const gallery = img.closest('.card-gallery');
    const imgs = [...gallery.querySelectorAll('.gallery-img')];
    const dots = [...gallery.querySelectorAll('.dot')];
    
    const currentIndex = imgs.findIndex(i => i.classList.contains('active'));
    const nextIndex = (currentIndex + 1) % imgs.length;
    
    imgs.forEach(i => i.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    imgs[nextIndex].classList.add('active');
    dots[nextIndex].classList.add('active');
}