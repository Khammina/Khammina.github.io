/* ============================================================
   Khammina SCMV — Portfolio Scripts  v3
   Three.js advanced scene · GSAP ScrollTrigger · Loading anim
   Typewriter · Custom cursor · Tilt · Particle trails
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════
   LOADING ANIMATION
══════════════════════════════════════════════ */
(function initLoader() {
  const loader   = document.getElementById('loader');
  const bar      = document.getElementById('loaderBar');
  const pct      = document.getElementById('loaderPct');
  const logoText = document.getElementById('loaderLogoText');
  if (!loader) return;

  const steps = [
    { label: 'Initializing engine…',  p: 15  },
    { label: 'Loading assets…',       p: 35  },
    { label: 'Building 3D scene…',    p: 58  },
    { label: 'Calibrating systems…',  p: 78  },
    { label: 'Almost ready…',         p: 92  },
    { label: 'Launch!',               p: 100 },
  ];

  let i = 0;
  const txt = document.getElementById('loaderStatus');

  function nextStep() {
    if (i >= steps.length) return;
    const s = steps[i++];
    if (bar) bar.style.width = s.p + '%';
    if (pct) pct.textContent = s.p + '%';
    if (txt) txt.textContent = s.label;
    if (i < steps.length) setTimeout(nextStep, 380 + Math.random() * 220);
  }
  nextStep();

  // Logo letter stagger
  if (logoText) {
    logoText.innerHTML = [...'KHAMMINA'].map((c,i) =>
      `<span style="animation-delay:${i*0.07}s">${c}</span>`).join('');
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (bar) bar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('loader--out');
        setTimeout(() => { loader.style.display = 'none'; initAll(); }, 700);
      }, 400);
    }, 600);
  });
})();

/* ══════════════════════════════════════════════
   INIT ALL
══════════════════════════════════════════════ */
function initAll() {
  initCursor();
  initNavbar();
  initHeroCanvas();
  initTypewriter();
  initGSAP();
  initScrollReveal();
  initSkillBars();
  initStatsCounter();
  initTilt();
  initContactForm();
  initMobileMenu();
  initParticleTrail();
  const yr = document.getElementById('footerYear');
  if (yr) yr.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function loop() {
    dot.style.transform  = `translate(${mx-4}px,${my-4}px)`;
    rx += (mx - rx) * 0.10;
    ry += (my - ry) * 0.10;
    ring.style.transform = `translate(${rx-16}px,${ry-16}px)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a,button,.project-card,.skill-card,.exp-card,.glass-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
  });
}

/* ══════════════════════════════════════════════
   PARTICLE TRAIL
══════════════════════════════════════════════ */
function initParticleTrail() {
  const colors = ['#00d2ff','#a78bfa','#00ffb4','#fbbf24'];
  document.addEventListener('mousemove', e => {
    if (Math.random() > 0.35) return;
    const p = document.createElement('div');
    p.className = 'mouse-particle';
    p.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${4+Math.random()*5}px;height:${4+Math.random()*5}px;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  });
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-link[data-section="${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
}

/* ══════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════ */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
}
function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburger');
  if (menu) menu.classList.remove('open');
  if (btn)  { btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
}

/* ══════════════════════════════════════════════
   THREE.JS HERO CANVAS — Advanced Scene
══════════════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W()/H(), 0.1, 1000);
  camera.position.z = 6;

  /* ── Particle field ── */
  const COUNT = 1800;
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);
  const palette = [
    new THREE.Color(0x00d2ff),
    new THREE.Color(0xa78bfa),
    new THREE.Color(0x00ffb4),
    new THREE.Color(0xfbbf24),
  ];
  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random()-0.5)*30;
    pos[i*3+1] = (Math.random()-0.5)*30;
    pos[i*3+2] = (Math.random()-0.5)*20;
    const c = palette[Math.floor(Math.random()*palette.length)];
    col[i*3]   = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.055, vertexColors: true,
    transparent: true, opacity: 0.75,
    sizeAttenuation: true,
  });
  scene.add(new THREE.Points(pGeo, pMat));

  /* ── Wireframe objects ── */
  const mkWire = (geo, color, opacity) => new THREE.Mesh(geo,
    new THREE.MeshBasicMaterial({ color, wireframe:true, transparent:true, opacity }));

  const oct = mkWire(new THREE.OctahedronGeometry(2.2,1),  0x00d2ff, 0.10);
  const ico = mkWire(new THREE.IcosahedronGeometry(1.4,0), 0xa78bfa, 0.09);
  const tor = mkWire(new THREE.TorusGeometry(1.8, 0.4, 12, 40), 0x00ffb4, 0.07);
  const tet = mkWire(new THREE.TetrahedronGeometry(1.0, 0), 0xfbbf24, 0.12);

  ico.position.set(3.5, -1.2, -2);
  tor.position.set(-3, 1, -1);
  tet.position.set(2, 2, -1);
  scene.add(oct, ico, tor, tet);

  /* ── DNA-like double helix ribbon ── */
  const helixPoints1 = [], helixPoints2 = [];
  for (let i = 0; i < 120; i++) {
    const t = (i / 120) * Math.PI * 6;
    helixPoints1.push(new THREE.Vector3(Math.cos(t)*1.2, (i/120)*8-4, Math.sin(t)*1.2));
    helixPoints2.push(new THREE.Vector3(Math.cos(t+Math.PI)*1.2, (i/120)*8-4, Math.sin(t+Math.PI)*1.2));
  }
  const hGeo1 = new THREE.BufferGeometry().setFromPoints(helixPoints1);
  const hGeo2 = new THREE.BufferGeometry().setFromPoints(helixPoints2);
  const hMat1 = new THREE.LineBasicMaterial({ color:0x00d2ff, transparent:true, opacity:0.35 });
  const hMat2 = new THREE.LineBasicMaterial({ color:0xa78bfa, transparent:true, opacity:0.35 });
  const helix1 = new THREE.Line(hGeo1, hMat1);
  const helix2 = new THREE.Line(hGeo2, hMat2);
  helix1.position.set(-5, 0, -3);
  helix2.position.set(-5, 0, -3);
  scene.add(helix1, helix2);

  /* ── Glowing grid plane ── */
  const grid = new THREE.GridHelper(40, 40, 0x00d2ff, 0x0a1628);
  grid.position.y = -5;
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  scene.add(grid);

  /* ── Mouse parallax ── */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / W() - 0.5) * 0.6;
    my = (e.clientY / H() - 0.5) * 0.6;
  });

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = W()/H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });

  /* ── Scroll parallax ── */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  /* ── Animate ── */
  (function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.0004;

    oct.rotation.x = t*0.35 + my*0.5;
    oct.rotation.y = t*0.55 + mx*0.5;
    ico.rotation.x = -t*0.4;
    ico.rotation.y =  t*0.65;
    tor.rotation.x =  t*0.3;
    tor.rotation.z =  t*0.25;
    tet.rotation.x =  t*0.5;
    tet.rotation.y = -t*0.4;
    helix1.rotation.y = t*0.3;
    helix2.rotation.y = t*0.3;
    grid.rotation.y   = t*0.05;

    /* Breathe effect on particle opacity */
    pMat.opacity = 0.55 + Math.sin(t*2)*0.2;

    /* Camera mouse + scroll parallax */
    camera.position.x += (mx*0.6 - camera.position.x) * 0.05;
    camera.position.y += (-my*0.6 - camera.position.y + scrollY*0.001) * 0.05;

    renderer.render(scene, camera);
  })();
}

/* ══════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const roles = [
    'MEPF Technical Engineer',
    'Shop Drawing Draftsman',
    'LPG System Engineer',
    'Expert Adviser Developer',
    'XAU & Forex Strategist',
    'Graphic Designer',
    'Freelance Consultant',
  ];
  let ri = 0, ci = 0, del = false;
  function tick() {
    const word = roles[ri];
    el.textContent = del ? word.slice(0,ci--) : word.slice(0,ci++);
    if (!del && ci > word.length)    { del = true; setTimeout(tick, 1500); return; }
    if ( del && ci < 0)              { del = false; ri = (ri+1)%roles.length; ci = 0; }
    setTimeout(tick, del ? 42 : 88);
  }
  tick();
}

/* ══════════════════════════════════════════════
   GSAP + SCROLLTRIGGER
══════════════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero entrance ── */
  const heroEls = ['.hero-greeting','.hero-name','.hero-role-wrap','.hero-desc','.hero-actions','.hero-socials'];
  heroEls.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.style.animation = 'none';
  });

  const tl = gsap.timeline({ delay: 0.3 });
  tl.fromTo('.hero-greeting',  {y:40,opacity:0},{y:0,opacity:1,duration:0.8,ease:'power3.out'})
    .fromTo('.hero-name',      {y:50,opacity:0},{y:0,opacity:1,duration:0.9,ease:'power3.out'},'-=0.5')
    .fromTo('.hero-role-wrap', {y:30,opacity:0},{y:0,opacity:1,duration:0.8,ease:'power3.out'},'-=0.55')
    .fromTo('.hero-desc',      {y:30,opacity:0},{y:0,opacity:1,duration:0.7,ease:'power3.out'},'-=0.5')
    .fromTo('.hero-actions',   {y:25,opacity:0},{y:0,opacity:1,duration:0.7,ease:'power3.out'},'-=0.45')
    .fromTo('.hero-socials',   {y:20,opacity:0},{y:0,opacity:1,duration:0.7,ease:'power3.out'},'-=0.45');

  /* ── Section headers parallax ── */
  document.querySelectorAll('.section-header').forEach(el => {
    gsap.fromTo(el,
      { y:60, opacity:0 },
      { y:0,  opacity:1, duration:0.9, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 85%', toggleActions:'play none none reverse' }
      });
  });

  /* ── About section ── */
  gsap.fromTo('.about-photo-wrap',
    { x:-80, opacity:0, rotateY:15 },
    { x:0,   opacity:1, rotateY:0, duration:1.1, ease:'power3.out',
      scrollTrigger:{ trigger:'.about-section', start:'top 75%' }
    });
  gsap.fromTo('.about-text',
    { x:80, opacity:0 },
    { x:0,  opacity:1, duration:1.1, ease:'power3.out',
      scrollTrigger:{ trigger:'.about-section', start:'top 75%' }
    });

  /* ── Experience cards stagger ── */
  gsap.fromTo('.exp-card',
    { y:60, opacity:0, scale:0.95 },
    { y:0,  opacity:1, scale:1, duration:0.75, stagger:0.15, ease:'back.out(1.4)',
      scrollTrigger:{ trigger:'.experience-timeline', start:'top 80%' }
    });

  /* ── Skill categories stagger ── */
  gsap.fromTo('.skills-category',
    { y:50, opacity:0 },
    { y:0,  opacity:1, duration:0.7, stagger:0.18, ease:'power3.out',
      scrollTrigger:{ trigger:'.skills-section', start:'top 75%' }
    });

  /* ── Project cards stagger ── */
  gsap.fromTo('.project-card',
    { y:70, opacity:0, scale:0.93 },
    { y:0,  opacity:1, scale:1, duration:0.8, stagger:0.12, ease:'back.out(1.2)',
      scrollTrigger:{ trigger:'.projects-grid', start:'top 80%' }
    });

  /* ── Contact ── */
  gsap.fromTo('.contact-info',
    { x:-60, opacity:0 },
    { x:0,   opacity:1, duration:1, ease:'power3.out',
      scrollTrigger:{ trigger:'.contact-section', start:'top 75%' }
    });
  gsap.fromTo('.contact-form',
    { x:60, opacity:0 },
    { x:0,  opacity:1, duration:1, ease:'power3.out',
      scrollTrigger:{ trigger:'.contact-section', start:'top 75%' }
    });

  /* ── Floating section backgrounds ── */
  document.querySelectorAll('.section').forEach(sec => {
    gsap.to(sec, {
      backgroundPositionY: '30%',
      ease: 'none',
      scrollTrigger: { trigger:sec, start:'top bottom', end:'bottom top', scrub:true }
    });
  });
}

/* ══════════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver fallback)
══════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════
   SKILL BARS
══════════════════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = (e.target.dataset.width||0) + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => obs.observe(f));
}

/* ══════════════════════════════════════════════
   STATS COUNTER
══════════════════════════════════════════════ */
function initStatsCounter() {
  const nums = document.querySelectorAll('.stat-number');
  if (!nums.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.target)||0;
        let cur = 0;
        const step = Math.ceil(target/45);
        const timer = setInterval(() => {
          cur = Math.min(cur+step, target);
          e.target.textContent = cur;
          if (cur >= target) clearInterval(timer);
        }, 38);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

/* ══════════════════════════════════════════════
   3D CARD TILT
══════════════════════════════════════════════ */
function initTilt() {
  document.querySelectorAll('.project-card,.exp-card,.skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 16;
      card.style.transform = `perspective(900px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(8px)`;
      card.style.boxShadow = `${-x*0.5}px ${-y*0.5}px 30px rgba(0,210,255,0.15)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

/* ══════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const n = form.name.value.trim();
    const em = form.email.value.trim();
    const s = form.subject.value.trim();
    const m = form.message.value.trim();
    if (!n||!em||!s||!m) {
      note.textContent='Please fill in all fields.'; note.style.color='#f87171'; return;
    }
    window.location.href = `mailto:khamminascmv@gmail.com?subject=${encodeURIComponent(s)}&body=${encodeURIComponent('From: '+n+' <'+em+'>\n\n'+m)}`;
    note.textContent='Opening your email client…'; note.style.color='#4ade80';
    form.reset();
  });
}
