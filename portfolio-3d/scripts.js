/* ================================================================
   Khammina SCMV — 3D Portfolio Scripts
   Libraries: Three.js (r128), GSAP 3 + ScrollTrigger
   Sections: Loader · Cursor · Navbar · Three.js Hero · Typewriter
             · Reveal Animations · Skill Bars · Stats Counter
             · Project Cards · Contact Form · Back-to-top
================================================================ */

'use strict';

/* ---------------------------------------------------------------
   Utility: wait for DOM
--------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. LOADER
     Simulates progress then fades out
  --------------------------------------------------------------- */
  const loader        = document.getElementById('loader');
  const loaderProg    = document.getElementById('loaderProgress');
  const loaderText    = document.getElementById('loaderText');

  const loaderSteps = [
    { pct: 20,  msg: 'Loading assets...' },
    { pct: 45,  msg: 'Initializing 3D engine...' },
    { pct: 70,  msg: 'Building scene...' },
    { pct: 90,  msg: 'Almost ready...' },
    { pct: 100, msg: 'Launch!' }
  ];

  let stepIndex = 0;
  const tickLoader = () => {
    if (stepIndex >= loaderSteps.length) {
      // Hide loader
      setTimeout(() => {
        loader.classList.add('hidden');
        // Trigger hero reveal after loader
        startHeroAnimation();
      }, 300);
      return;
    }
    const s = loaderSteps[stepIndex++];
    loaderProg.style.width   = s.pct + '%';
    loaderText.textContent   = s.msg;
    setTimeout(tickLoader, 320 + Math.random() * 200);
  };
  setTimeout(tickLoader, 150);

  /* ---------------------------------------------------------------
     2. CUSTOM CURSOR
  --------------------------------------------------------------- */
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows immediately
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Ring lags behind for a smooth tail effect
  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  // Hover state for interactive elements
  const hoverTargets = document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* ---------------------------------------------------------------
     3. NAVBAR
     - Scrolled state (background)
     - Active link highlighting
     - Mobile hamburger
  --------------------------------------------------------------- */
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scrolled class
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    // Back-to-top visibility
    updateBackToTop();
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close mobile menu helper (called inline in HTML)
  window.closeMobileMenu = () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  // Active nav link on scroll via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => navObserver.observe(s));

  /* ---------------------------------------------------------------
     4. THREE.JS — HERO PARTICLE FIELD
     Floating point cloud + slowly rotating geometry
  --------------------------------------------------------------- */
  const canvas = document.getElementById('heroCanvas');

  if (typeof THREE !== 'undefined' && canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 200);
    camera.position.z = 50;

    /* -- Particle geometry -- */
    const PARTICLE_COUNT = 1200;
    const positions  = new Float32Array(PARTICLE_COUNT * 3);
    const colors     = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = [];

    const colorA = new THREE.Color('#64d2ff');  // cyan
    const colorB = new THREE.Color('#a78bfa');  // violet

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 120;
      positions[i3 + 1] = (Math.random() - 0.5) * 80;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;

      // Mix colour between cyan and violet
      const mix = Math.random();
      const c   = colorA.clone().lerp(colorB, mix);
      colors[i3]     = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      // Random drift velocity
      velocities.push(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        0
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    /* -- Wireframe octahedron (decorative) -- */
    const octGeo = new THREE.OctahedronGeometry(8, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#64d2ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const octaMesh = new THREE.Mesh(octGeo, octMat);
    octaMesh.position.set(28, 4, -10);
    scene.add(octaMesh);

    /* -- Wireframe icosahedron -- */
    const icoGeo = new THREE.IcosahedronGeometry(5, 0);
    const icoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#a78bfa'),
      wireframe: true,
      transparent: true,
      opacity: 0.14
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(-32, -8, -5);
    scene.add(icoMesh);

    /* -- Mouse parallax -- */
    let targetRotX = 0, targetRotY = 0;
    document.addEventListener('mousemove', (e) => {
      targetRotY = (e.clientX / window.innerWidth  - 0.5) * 0.3;
      targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.15;
    });

    /* -- Animation loop -- */
    const posAttr = geo.attributes.position;
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame++;

      // Drift particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        posAttr.array[i3]     += velocities[i3];
        posAttr.array[i3 + 1] += velocities[i3 + 1];

        // Wrap at boundaries
        if (posAttr.array[i3]     >  60)  posAttr.array[i3]     = -60;
        if (posAttr.array[i3]     < -60)  posAttr.array[i3]     =  60;
        if (posAttr.array[i3 + 1] >  40)  posAttr.array[i3 + 1] = -40;
        if (posAttr.array[i3 + 1] < -40)  posAttr.array[i3 + 1] =  40;
      }
      posAttr.needsUpdate = true;

      // Smooth parallax
      particles.rotation.y += (targetRotY - particles.rotation.y) * 0.04;
      particles.rotation.x += (targetRotX - particles.rotation.x) * 0.04;

      // Spin decorative shapes
      octaMesh.rotation.x += 0.003;
      octaMesh.rotation.y += 0.005;
      icoMesh.rotation.x  -= 0.004;
      icoMesh.rotation.z  += 0.003;

      renderer.render(scene, camera);
    };
    animate();

    /* -- Resize handler -- */
    window.addEventListener('resize', () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  }

  /* ---------------------------------------------------------------
     5. TYPEWRITER EFFECT
  --------------------------------------------------------------- */
  const typewriterEl = document.getElementById('typewriter');
  const roles = [
    'MEP Engineer',
    'Electrical Designer',
    'Mechanical & Plumbing',
    'Graphic Designer',
    'Freelancer'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeTimeout;

  const typeStep = () => {
    const current = roles[roleIndex];
    if (!isDeleting) {
      typewriterEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        typeTimeout = setTimeout(typeStep, 1800);
        return;
      }
    } else {
      typewriterEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex  = (roleIndex + 1) % roles.length;
        typeTimeout = setTimeout(typeStep, 400);
        return;
      }
    }
    typeTimeout = setTimeout(typeStep, isDeleting ? 45 : 80);
  };

  // Start after loader
  const startTypewriter = () => {
    clearTimeout(typeTimeout);
    typeTimeout = setTimeout(typeStep, 600);
  };

  /* ---------------------------------------------------------------
     6. HERO ENTRANCE ANIMATION (GSAP — if available)
  --------------------------------------------------------------- */
  const startHeroAnimation = () => {
    startTypewriter();

    if (typeof gsap !== 'undefined') {
      gsap.from('#heroGreeting', { duration: 0.8, y: 30, opacity: 0, delay: 0.1, ease: 'power3.out' });
      gsap.from('#heroName .name-line', {
        duration: 0.9, y: 40, opacity: 0, stagger: 0.15, delay: 0.3, ease: 'power3.out'
      });
      gsap.from('#heroRole',    { duration: 0.7, y: 20, opacity: 0, delay: 0.65, ease: 'power2.out' });
      gsap.from('#heroDesc',    { duration: 0.7, y: 20, opacity: 0, delay: 0.8,  ease: 'power2.out' });
      gsap.from('#heroActions', { duration: 0.7, y: 20, opacity: 0, delay: 0.95, ease: 'power2.out' });
      gsap.from('#heroSocials', { duration: 0.7, y: 20, opacity: 0, delay: 1.1,  ease: 'power2.out' });
    } else {
      // Fallback: instantly show all hero elements
      ['heroGreeting','heroName','heroRole','heroDesc','heroActions','heroSocials'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
    }
  };

  /* ---------------------------------------------------------------
     7. SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------------
     8. SKILL BARS — animate fill when section is visible
  --------------------------------------------------------------- */
  const skillSection  = document.getElementById('skills');
  let skillsAnimated  = false;

  const animateSkillBars = () => {
    document.querySelectorAll('.skill-fill').forEach(bar => {
      const target = bar.dataset.width;
      bar.style.width = target + '%';
    });
  };

  const skillObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !skillsAnimated) {
      skillsAnimated = true;
      animateSkillBars();
      skillObserver.disconnect();
    }
  }, { threshold: 0.2 });

  if (skillSection) skillObserver.observe(skillSection);

  /* ---------------------------------------------------------------
     9. STATS COUNTER (About section)
  --------------------------------------------------------------- */
  const statNumbers   = document.querySelectorAll('.stat-number');
  let statsAnimated   = false;

  const animateStats = () => {
    statNumbers.forEach(el => {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const step     = target / (duration / 16);
      let current    = 0;
      const tick = () => {
        current += step;
        if (current >= target) { el.textContent = target; return; }
        el.textContent = Math.floor(current);
        requestAnimationFrame(tick);
      };
      tick();
    });
  };

  const aboutSection = document.getElementById('about');
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      animateStats();
      statsObserver.disconnect();
    }
  }, { threshold: 0.3 });

  if (aboutSection) statsObserver.observe(aboutSection);

  /* ---------------------------------------------------------------
     10. PROJECT CARD — 3D tilt on mouse move
  --------------------------------------------------------------- */
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const rotY    = ((e.clientX - centerX) / (rect.width  / 2)) * 5;  // max ±5 deg
      const rotX    = ((e.clientY - centerY) / (rect.height / 2)) * -4; // max ±4 deg
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------------------------------------------------------------
     11. CONTACT FORM
     Simple mailto fallback (no backend)
  --------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formNote    = document.getElementById('formNote');
  const formBtnText = document.getElementById('formBtnText');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = document.getElementById('formName').value.trim();
      const email   = document.getElementById('formEmail').value.trim();
      const subject = document.getElementById('formSubject').value.trim() || 'Portfolio Contact';
      const message = document.getElementById('formMessage').value.trim();

      // Basic validation
      if (!name || !email || !message) {
        formNote.textContent   = '⚠ Please fill in all required fields.';
        formNote.style.color   = '#f87171';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formNote.textContent = '⚠ Please enter a valid email address.';
        formNote.style.color = '#f87171';
        return;
      }

      // Build mailto link as fallback
      const body   = `Hi Khammina,\n\n${message}\n\nFrom: ${name} (${email})`;
      const mailto = `mailto:khamminascmv@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      formBtnText.textContent = 'Opening email client...';
      window.location.href = mailto;

      setTimeout(() => {
        formBtnText.textContent = 'Send Message';
        formNote.textContent    = '✓ Email client opened. Thank you!';
        formNote.style.color    = 'var(--color-accent)';
        contactForm.reset();
      }, 1500);
    });
  }

  /* ---------------------------------------------------------------
     12. BACK TO TOP BUTTON
  --------------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  const updateBackToTop = () => {
    if (!backToTop) return;
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------
     13. SMOOTH ANCHOR SCROLL (for older browsers that don't support
         CSS scroll-behavior: smooth natively in all contexts)
  --------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------------------------------------------------------------
     14. GSAP SCROLL TRIGGER — section parallax (optional enhancement)
  --------------------------------------------------------------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Slight parallax on hero shapes
    gsap.to('.hero-shapes', {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Section headings pop-in
    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.from(header, {
        scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
        y: 30, opacity: 0, duration: 0.8, ease: 'power2.out'
      });
    });
  }

}); // END DOMContentLoaded
