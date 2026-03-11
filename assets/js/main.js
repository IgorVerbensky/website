/* ================== ON LOAD (GSAP intro + ABOUT wipe) ================== */
window.addEventListener('load', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // 1. Вхідні анімації при завантаженні
  gsap.from('.reveal-line', { y: 14, opacity: 0, duration: 0.9, ease: 'power2.out', stagger: 0.15 });
  gsap.from(['.lead','.cta'], { opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.45, stagger: 0.2 });
  gsap.from('.hero-img', { opacity: 0, y: 10, scale: 0.98, duration: 0.8, ease: 'power2.out', delay: 0.35 });

  // ==============================================================
  // 2. ФІКСАЦІЯ МЕНЮ ТА ГЕРОЯ (Разом) ДЛЯ АНІМАЦІЇ КВІТКИ
  // ==============================================================
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  let triggerEl = ".hero";

  // Динамічно обгортаємо хедер і героя в один блок, щоб зафіксувати їх разом
  if (header && hero) {
    const pinWrapper = document.createElement('div');
    pinWrapper.className = 'hero-pin-wrapper';
    header.parentNode.insertBefore(pinWrapper, header);
    pinWrapper.appendChild(header);
    pinWrapper.appendChild(hero);
    triggerEl = pinWrapper;
  }

  const canvas = document.getElementById("hero-sequence");
  if (canvas) {
    const context = canvas.getContext("2d");
    const frameCount = 81; 
    
    // Формуємо шлях до файлів з дужками
    const currentFrame = index => `assets/img/sequence/frame (${index + 1}).png`;
    const images = [];
    const playhead = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    images[0].onload = render;

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(images[playhead.frame], 0, 0, canvas.width, canvas.height);
    }

    // Таймлайн для фіксації всього верхнього екрану (Меню + Герой)
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,    // Тригер - наша нова обгортка
        start: "top top",      // Спрацьовує одразу при завантаженні (від верху екрана)
        end: "+=2500",         // Тривалість анімації (чим більше, тим повільніше)
        pin: true,             // Фіксуємо ЕКРАН РАЗОМ З МЕНЮ
        scrub: 1.2,            // Плавність програвання
        anticipatePin: 1
      }
    });

    heroTl.to(playhead, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      onUpdate: render,
      duration: 1
    });
  }

  // ==============================================================
  // 3. ЗМІНА КОЛЬОРУ ТА ПЕРЕХІД ДО СЕКЦІЇ ABOUT
  // ==============================================================
  const root = document.documentElement;
  const HERO_BG = '#E8E8E6';
  const PINK_BG = '#F4A9A8';
  gsap.set(root, { '--page-bg': HERO_BG });

  gsap.timeline({
    scrollTrigger: {
      trigger: '#about',
      start: 'top bottom', 
      end: 'top center',   
      scrub: true,
      invalidateOnRefresh: true
    }
  }).to(root, { '--page-bg': PINK_BG, duration: 1, ease: 'none' });

gsap.fromTo('.hero-img', 
    { opacity: 1 }, 
    {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: '#about',
        start: 'top bottom',
        end: 'top center',
        scrub: true,
        immediateRender: false 
      }
    }
  );

  /* ====== ABOUT wipe (панель справа→ліво + reveal нового тексту) ====== */
  function positionAboutNew(){
    const about   = document.querySelector('#about');
    const lines   = about?.querySelectorAll('.pc-text-line');
    const newText = about?.querySelector('.about-new');
    if (!about || !lines || lines.length < 2 || !newText) return;

    const target     = lines[1];
    const aboutRect  = about.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const left = Math.round(targetRect.left - aboutRect.left);
    const top  = Math.round(targetRect.top  - aboutRect.top);

    const cs = window.getComputedStyle(target);
    newText.style.fontFamily    = cs.fontFamily;
    newText.style.fontSize      = cs.fontSize;
    newText.style.lineHeight    = cs.lineHeight;
    newText.style.fontWeight    = cs.fontWeight;
    newText.style.letterSpacing = cs.letterSpacing;
    newText.style.color         = '#000';

    const layer = about.querySelector('.about-reveal-text');
    layer?.style.setProperty('--matchLeft', `${left}px`);
    layer?.style.setProperty('--matchTop',  `${top}px`);
  }

  positionAboutNew();
  window.addEventListener('resize', () => { positionAboutNew(); ScrollTrigger.refresh(); });
  ScrollTrigger.addEventListener('refresh', positionAboutNew);

  const about = document.querySelector('#about');
  const newText = about?.querySelector('.about-new');

  const wipeTL = gsap.timeline({
    scrollTrigger: {
      trigger: '#about',
      start: 'center center',
      end: '+=100%',
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: self => updateReveal(self.progress)
    }
  });
  wipeTL.to('.about-wipe-layer', { '--wipeScale': 1, duration: 1, ease: 'none' }, 0);

  function updateReveal(progress){
    if (!about || !newText) return;
    const aboutRect = about.getBoundingClientRect();
    const ntRect    = newText.getBoundingClientRect();
    const panelLeftX = aboutRect.right - aboutRect.width * progress;
    const insetLeft  = Math.max(Math.ceil(panelLeftX - ntRect.left) + 1, 0);
    about.querySelector('.about-wipe-layer')
         ?.style.setProperty('--winLeftPx', `${insetLeft}px`);
  }
}); // end load


/* ================== EDUCATION preview hover/click ================== */
document.querySelectorAll('.edu-item').forEach(item => {
  const setImg = () => {
    const imgSrc  = item.getAttribute('data-img');
    const preview = document.querySelector('.edu-img');
    if (preview) {
      preview.src = imgSrc;
      preview.classList.add('show');
    }
  };
  item.addEventListener('mouseenter', setImg);
  item.addEventListener('click', setImg); 
});


/* ================== HOWTO SCROLL-STEPPER ================== */
let __lastScrollY = window.scrollY;
let __scrollDir   = 1;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  __scrollDir = (y > __lastScrollY) ? 1 : -1;
  __lastScrollY = y;
}, { passive: true });

(() => {
  const section    = document.getElementById('howto');
  const title      = document.getElementById('howtoTitle');
  const panel      = document.getElementById('pairPanel');
  const pointsWrap = document.getElementById('points');
  if (!section || !title || !panel || !pointsWrap) return;

  const points = Array.from(pointsWrap.querySelectorAll('.point'));

  const pairs = [
    { text: 'можна приходити з плутаниною, мовчанням чи сильними емоціями.', activeIndex: 0 },
    { text: 'усе сказане залишається між нами.', activeIndex: 1 },
    { text: 'знайомимося і визначаємо, що важливо зараз.', activeIndex: 2 },
    { text: 'немає “правильного” ритму, рухаємося так, як комфортно.', activeIndex: 3 },
    { text: 'сесії онлайн, офлайн або у змішаному форматі.', activeIndex: 4 },
    { text: 'онлайн або в кабінеті - біля метро Звіринецька (м. Київ). Як правило 1 раз на тиждень.', activeIndex: 5 }
  ];

  let inSequence  = false; 
  let step        = -1;    
  let lastWheelTs = 0;     

  function resetPoints(){ points.forEach(p => p.classList.remove('point--active')); }
  function setActivePoint(index){
    resetPoints();
    const t = points[index];
    if (t) t.classList.add('point--active');
  }

  function renderPairText(newText){
    const oldNode = panel.querySelector('.pair-text[data-state="in"]');
    if (oldNode){
      oldNode.dataset.state = 'out';
      oldNode.addEventListener('transitionend', () => oldNode.remove(), { once:true });
    }
    const textNode = document.createElement('p');
    textNode.className   = 'pair-text';
    textNode.textContent = newText;
    textNode.dataset.state = 'in';
    panel.appendChild(textNode);
  }

  function goToStep(next){
    if (next < 0){
      endSequence({ direction: 'backward' });
      return;
    }
    if (next >= pairs.length){
      endSequence({ direction: 'forward' });
      return;
    }
    step = next;
    const { text, activeIndex } = pairs[step];
    setActivePoint(activeIndex);
    renderPairText(text);
  }

  function startSequence(initialStep = 0){
    if (inSequence) return;
    inSequence = true;
    panel.classList.add('is-visible');
    lockScroll();
    goToStep(initialStep);
  }

  function endSequence(){
    unlockScroll();
    inSequence = false;
    step = -1;
    resetPoints(); 
  }

  function onWheel(e){
    if (!inSequence) return;
    const now = performance.now();
    if (now - lastWheelTs < 220){ e.preventDefault(); return; } 
    lastWheelTs = now;

    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    goToStep(step + dir);
  }

  let touchStartY = null;
  function onTouchStart(e){ if (!inSequence) return; touchStartY = e.touches[0].clientY; }
  function onTouchMove(e){
    if (!inSequence || touchStartY === null) return;
    const dy = touchStartY - e.touches[0].clientY;
    if (Math.abs(dy) < 24) return;
    e.preventDefault();
    const dir = dy > 0 ? 1 : -1;
    touchStartY = e.touches[0].clientY;
    goToStep(step + dir);
  }

  function onKey(e){
    if (!inSequence) return;
    if (['ArrowDown','PageDown','ArrowUp','PageUp',' '].includes(e.key)){
      e.preventDefault();
      const dir = (e.key==='ArrowUp'||e.key==='PageUp') ? -1 : 1;
      goToStep(step + dir);
    }
    if (e.key === 'Escape'){ endSequence(); }
  }

  function lockScroll(){
    window.addEventListener('wheel', onWheel, { passive:false });
    window.addEventListener('touchstart', onTouchStart, { passive:false });
    window.addEventListener('touchmove', onTouchMove, { passive:false });
    window.addEventListener('keydown', onKey, { passive:false });
  }
  function unlockScroll(){
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKey);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const initial = (__scrollDir < 0) ? (pairs.length - 1) : 0;
      startSequence(initial);
    });
  }, { root:null, rootMargin:'-20% 0px -80% 0px', threshold:0 });

  io.observe(title);
})();

// ===== Footer helpers =====
(function(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href="#top"], .back-to-top').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();