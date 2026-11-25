/* ==========================================================================
   STUDIO FITNESS — INTERAÇÕES
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // CONFIRMAR: número de WhatsApp do estúdio antes de publicar
  const WHATSAPP = '553532926830';

  /* 1. Header fixo + menu ativo conforme a rolagem */
  const header = document.getElementById('mainHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const ids = ['inicio', 'atendimento', 'horarios', 'planos', 'avaliacoes', 'contato'];
  let ticking = false;

  const onScroll = () => {
    ticking = false;
    header.classList.toggle('is-scrolled', window.scrollY > 52);
    const pos = window.scrollY + window.innerHeight * 0.35;
    let current = 'inicio';
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= pos) current = id;
    });
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* 2. Menu lateral */
  const drawer = document.getElementById('sideDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const openBtn = document.getElementById('drawerOpenBtn');
  const closeBtn = document.getElementById('drawerCloseBtn');

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const closeDrawer = () => {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    backdrop.hidden = true;
    document.body.style.overflow = '';
    openBtn.focus();
  };
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  /* 3. Revelação ao rolar: um único IntersectionObserver.
        Sem JS, sem suporte ou com movimento reduzido, tudo fica visível. */
  const items = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window && items.length) {
    document.documentElement.classList.add('js-reveal');
    items.forEach((el) => {
      const idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx, 3) * 80 + 'ms';
      el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity') el.style.transitionDelay = '';
      });
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* 4. Formulário: monta a mensagem e abre o WhatsApp */
  const form = document.getElementById('leadForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('leadName').value.trim();
    const zap = document.getElementById('leadPhone').value.trim();
    const hora = document.getElementById('leadTime').value;
    const texto = `Olá, meu nome é ${nome}. Meu WhatsApp é ${zap}. Prefiro treinar às ${hora}.`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  });

  /* 5. Ano no rodapé */
  document.getElementById('ano').textContent = new Date().getFullYear();

  /* 6. Partículas (brasas vermelhas) no hero e no "sobre" */
  const initEmbers = (id, count) => {
    const canvas = document.getElementById(id);
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, visible = true;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth || window.innerWidth;
      h = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    const ps = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.35) * 0.5, vy: -(Math.random() * 0.7 + 0.2),
      a: Math.random() * 0.6 + 0.2, long: Math.random() > 0.65,
    }));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(canvas);
    }
    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        for (const p of ps) {
          p.x += p.vx; p.y += p.vy;
          if (p.y < -12) { p.y = h + 10; p.x = Math.random() * w; }
          if (p.x > w + 12) p.x = -10;
          if (p.x < -12) p.x = w + 10;
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.long) {
            ctx.rotate(-0.45);
            ctx.fillStyle = `rgba(240, 70, 80, ${p.a * 0.75})`;
            ctx.fillRect(-p.r * 2.2, -p.r * 0.45, p.r * 4.4, p.r * 0.9);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(225, 29, 46, ${p.a})`;
            ctx.fill();
          }
          ctx.restore();
        }
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
  initEmbers('heroEmbers', 26);
  initEmbers('aboutEmbers', 20);
});
