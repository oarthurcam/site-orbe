/* ============================================
   ORBE - Landing Page JavaScript
   Redesign: smoother animations, parallax,
   gradual scroll text, refined observers
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. SCROLL REVEAL (Intersection Observer)
  //    Threshold lowered so elements trigger earlier
  // ============================================
  const fadeElements = document.querySelectorAll('.fade-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
  });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // ============================================
  // 1.5 HERO PARTICLE FIELD (three.js)
  //     1500 partículas azul/ciano com parallax do mouse
  // ============================================
  const heroCanvas = document.getElementById('heroParticles');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Gera textura circular com gradiente (deixa as partículas redondas e com glow)
  function makeSoftCircleTexture() {
    if (typeof THREE === 'undefined') return null;
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0.00, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.25)');
    grad.addColorStop(0.85, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1.00, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  function initHeroParticles() {
    if (!heroCanvas || typeof THREE === 'undefined') return;

    const heroSection = heroCanvas.parentElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Geometria das partículas
    const count = window.innerWidth < 768 ? 800 : 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribuição esférica
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Cor azul→ciano
      const t = Math.random();
      colors[i * 3]     = 0.0 + t * 0.05;
      colors[i * 3 + 1] = 0.45 + t * 0.35;
      colors[i * 3 + 2] = 1.0;

      sizes[i] = Math.random() * 0.04 + 0.015;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: makeSoftCircleTexture(),
      alphaTest: 0.001
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    function resize() {
      const w = heroSection.clientWidth;
      const h = heroSection.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Pausa quando a section sai do viewport
    let visible = true;
    const visObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 });
    visObserver.observe(heroSection);

    let rafId;
    function animate() {
      if (visible && !reduceMotion) {
        particles.rotation.y += 0.0008;
        particles.rotation.x += 0.0003;

        targetX += (mouseX * 0.6 - targetX) * 0.04;
        targetY += (mouseY * 0.6 - targetY) * 0.04;
        camera.position.x = targetX;
        camera.position.y = targetY;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(animate);
    }

    // Primeiro frame + fade-in
    renderer.render(scene, camera);
    requestAnimationFrame(() => {
      heroCanvas.classList.add('ready');
      if (!reduceMotion) animate();
    });
  }

  // ============================================
  // 1.6 NEURO NETWORK (para-quem.html)
  //     Rede neural 3D com conexões que pulsam e se desfazem
  // ============================================
  const brainCanvas = document.getElementById('neuroBrain');

  function initBrainVisualization() {
    if (!brainCanvas || typeof THREE === 'undefined') return;
    if (typeof THREE.GLTFLoader === 'undefined') return; // espera o loader

    const container = brainCanvas.parentElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
    camera.position.set(0, 0, 1.25);

    const renderer = new THREE.WebGLRenderer({
      canvas: brainCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let visible = true;
    const obs = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 });
    obs.observe(container);

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }, { passive: true });
    container.addEventListener('mouseleave', () => {
      mouseX = 0; mouseY = 0;
    });

    // Carrega o modelo anatomico real
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/brain.glb', (gltf) => {
      // Procura o primeiro mesh dentro da scene (estrutura pode ser aninhada)
      let brainMesh = null;
      gltf.scene.traverse((obj) => {
        if (!brainMesh && obj.isMesh && obj.geometry && obj.geometry.attributes && obj.geometry.attributes.position) {
          brainMesh = obj;
        }
      });

      if (!brainMesh) {
        console.error('brain.glb carregado, mas nenhum Mesh com geometria encontrado.');
        return;
      }

      console.log('Brain mesh carregado — vertices:', brainMesh.geometry.attributes.position.count);

      const sourceGeometry = brainMesh.geometry;
      const sourcePositions = sourceGeometry.attributes.position.array;
      const vertexCount = sourceGeometry.attributes.position.count;

      // Para deixar mais denso: vamos amostrar pontos EXTRAS dentro de cada triângulo
      // além dos vértices originais. Cada triângulo recebe N pontos via barycentric.
      const samplesPerTriangle = 4;
      const indexAttr = sourceGeometry.index;

      const allPositions = [];

      // 1) Vértices originais
      for (let i = 0; i < vertexCount; i++) {
        allPositions.push(
          sourcePositions[i * 3],
          sourcePositions[i * 3 + 1],
          sourcePositions[i * 3 + 2]
        );
      }

      // 2) Pontos extras nos triângulos (barycentric sampling)
      function pushBaryPoints(ax, ay, az, bx, by, bz, cx, cy, cz) {
        for (let s = 0; s < samplesPerTriangle; s++) {
          let r1 = Math.random();
          let r2 = Math.random();
          if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
          const w1 = 1 - r1 - r2;
          allPositions.push(
            ax * w1 + bx * r1 + cx * r2,
            ay * w1 + by * r1 + cy * r2,
            az * w1 + bz * r1 + cz * r2
          );
        }
      }

      if (indexAttr) {
        const idx = indexAttr.array;
        for (let i = 0; i < idx.length; i += 3) {
          const ia = idx[i] * 3, ib = idx[i + 1] * 3, ic = idx[i + 2] * 3;
          pushBaryPoints(
            sourcePositions[ia],     sourcePositions[ia + 1], sourcePositions[ia + 2],
            sourcePositions[ib],     sourcePositions[ib + 1], sourcePositions[ib + 2],
            sourcePositions[ic],     sourcePositions[ic + 1], sourcePositions[ic + 2]
          );
        }
      } else {
        // geometria não-indexada: cada 3 vértices consecutivos = 1 triângulo
        for (let i = 0; i < vertexCount; i += 3) {
          const ia = i * 3, ib = (i + 1) * 3, ic = (i + 2) * 3;
          pushBaryPoints(
            sourcePositions[ia],     sourcePositions[ia + 1], sourcePositions[ia + 2],
            sourcePositions[ib],     sourcePositions[ib + 1], sourcePositions[ib + 2],
            sourcePositions[ic],     sourcePositions[ic + 1], sourcePositions[ic + 2]
          );
        }
      }

      const totalCount = allPositions.length / 3;
      console.log('Brain — pontos totais:', totalCount, '(vertices:', vertexCount, '+ surface samples)');

      const positions = new Float32Array(totalCount * 3);
      const origins   = new Float32Array(totalCount * 3);
      const colors    = new Float32Array(totalCount * 3);
      const decay     = new Float32Array(totalCount);

      for (let i = 0; i < totalCount; i++) {
        const x = allPositions[i * 3];
        const y = allPositions[i * 3 + 1];
        const z = allPositions[i * 3 + 2];

        positions[i * 3]     = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        origins[i * 3]       = x;
        origins[i * 3 + 1]   = y;
        origins[i * 3 + 2]   = z;

        const t = Math.random();
        colors[i * 3]     = 0.0 + t * 0.06;
        colors[i * 3 + 1] = 0.55 + t * 0.4;
        colors[i * 3 + 2] = 1.0;

        decay[i] = Math.random() < 0.05 ? Math.random() * 0.4 : 0;
      }

      // Atualiza as variáveis locais usadas no loop pra refletir o novo tamanho
      const vertexCountTotal = totalCount;

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.008,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        map: makeSoftCircleTexture(),
        alphaTest: 0.001
      });

      const brain = new THREE.Points(geometry, material);

      // Orientação + deslocamento pra direita (cuidado pra não sair do frame)
      brain.rotation.x = -0.15;
      brain.position.x = 0.08;
      scene.add(brain);

      const posArr = geometry.attributes.position.array;
      const colArr = geometry.attributes.color.array;

      function animate() {
        if (visible && !reduceMotion) {
          // Inicia decay em algumas partículas (proporcional ao count pra dar a sensação)
          const decayPerFrame = Math.max(4, Math.floor(vertexCountTotal / 800));
          for (let n = 0; n < decayPerFrame; n++) {
            const i = Math.floor(Math.random() * vertexCountTotal);
            if (decay[i] === 0) decay[i] = 0.001;
          }

          for (let i = 0; i < vertexCountTotal; i++) {
            if (decay[i] > 0) {
              decay[i] += 0.006;

              const ox = origins[i * 3];
              const oy = origins[i * 3 + 1];
              const oz = origins[i * 3 + 2];
              const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;

              const drift = decay[i] * 0.18;
              posArr[i * 3]     = ox + (ox / len) * drift;
              posArr[i * 3 + 1] = oy + (oy / len) * drift - decay[i] * 0.1;
              posArr[i * 3 + 2] = oz + (oz / len) * drift;

              const fade = Math.max(0, 1 - decay[i]);
              const t = (i % 17) / 17;
              colArr[i * 3]     = (0.0 + t * 0.06) * fade;
              colArr[i * 3 + 1] = (0.55 + t * 0.4) * fade;
              colArr[i * 3 + 2] = 1.0 * fade;

              if (decay[i] >= 1) {
                decay[i] = 0;
                posArr[i * 3]     = ox;
                posArr[i * 3 + 1] = oy;
                posArr[i * 3 + 2] = oz;
                colArr[i * 3]     = 0.0 + t * 0.06;
                colArr[i * 3 + 1] = 0.55 + t * 0.4;
                colArr[i * 3 + 2] = 1.0;
              }
            }
          }
          geometry.attributes.position.needsUpdate = true;
          geometry.attributes.color.needsUpdate = true;

          // Rotação suave
          brain.rotation.y += 0.0028;

          // Parallax mouse
          targetX += (mouseX * 0.08 - targetX) * 0.05;
          targetY += (-mouseY * 0.08 - targetY) * 0.05;
          camera.position.x = targetX;
          camera.position.y = targetY;
          camera.lookAt(0, 0, 0);

          renderer.render(scene, camera);
        }
        requestAnimationFrame(animate);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(() => {
        brainCanvas.classList.add('ready');
        if (!reduceMotion) animate();
      });
    }, undefined, (err) => {
      console.error('Erro ao carregar brain.glb', err);
    });
  }

  function bootThree() {
    if (typeof THREE === 'undefined') return false;
    initHeroParticles();
    // Cérebro: só na para-quem.html e só quando o GLTFLoader já estiver pronto
    if (brainCanvas && typeof THREE.GLTFLoader !== 'undefined') {
      initBrainVisualization();
    }
    return true;
  }

  if (!bootThree()) {
    // espera os scripts deferred carregarem
    window.addEventListener('load', () => {
      bootThree();
      // Se o canvas do cérebro existir mas o loader ainda não, tenta de novo em 200ms
      if (brainCanvas && typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'undefined') {
        const tick = setInterval(() => {
          if (typeof THREE.GLTFLoader !== 'undefined') {
            clearInterval(tick);
            initBrainVisualization();
          }
        }, 200);
        // Desiste depois de 5s
        setTimeout(() => clearInterval(tick), 5000);
      }
    });
  } else if (brainCanvas && typeof THREE.GLTFLoader === 'undefined') {
    // THREE carregou, brain canvas existe, mas GLTFLoader ainda não — espera o load
    window.addEventListener('load', () => {
      if (typeof THREE.GLTFLoader !== 'undefined') initBrainVisualization();
    });
  }

  // ============================================
  // 2. SCROLL TEXT — gradual word illumination
  // ============================================
  const scrollSection = document.querySelector('.scroll-text-section');
  const scrollWords = document.querySelectorAll('.scroll-word');

  if (scrollSection && scrollWords.length > 0) {
    let scrollTicking = false;

    const updateScrollText = () => {
      const rect = scrollSection.getBoundingClientRect();
      const sectionHeight = scrollSection.offsetHeight;
      const windowHeight = window.innerHeight;

      const scrollProgress = Math.max(0, Math.min(1,
        (-rect.top + windowHeight * 0.4) / (sectionHeight - windowHeight)
      ));

      const totalWords = scrollWords.length;
      const activePosition = scrollProgress * totalWords;

      scrollWords.forEach((word, i) => {
        const distance = activePosition - i;

        if (distance > 0.3) {
          word.classList.add('lit');
        } else {
          word.classList.remove('lit');
        }
      });

      scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(updateScrollText);
        scrollTicking = true;
      }
    }, { passive: true });

    updateScrollText();
  }

  // ============================================
  // 3. ANIMATED COUNTERS (supports decimals)
  // ============================================
  const counterElements = document.querySelectorAll('[data-target]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counterElements.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const isDecimal = el.dataset.decimal === 'true';
    const target = isDecimal ? parseFloat(el.dataset.target) : parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2200;
    const start = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = easedProgress * target;

      if (isDecimal) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.round(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================
  // 4. XP BAR ANIMATION
  // ============================================
  const xpFill = document.getElementById('xpFill');
  if (xpFill) {
    const xpObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          xpFill.classList.add('animate');
          xpObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    xpObserver.observe(xpFill);
  }

  // ============================================
  // 5. MOBILE NAVIGATION
  // ============================================
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // 6. NAVBAR — hide on scroll down, show on scroll up
  // ============================================
  const navbar = document.getElementById('navbar');

  if (navbar) {
    let lastScrollY = window.scrollY;
    let navTicking = false;

    const updateNav = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }

      // Hide/show based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add('nav-hidden');
      } else {
        navbar.classList.remove('nav-hidden');
      }

      lastScrollY = currentScrollY;
      navTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!navTicking) {
        requestAnimationFrame(updateNav);
        navTicking = true;
      }
    }, { passive: true });
  }

  // ============================================
  // 7. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================
  // 7.5 TESTIMONIALS MARQUEE — clone cards for seamless loop
  // ============================================
  document.querySelectorAll('.marquee-track').forEach(track => {
    const originals = Array.from(track.children);
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  // ============================================
  // 8. PARALLAX ON PHONE MOCKUPS (desktop only)
  //    Subtle translateY based on scroll position
  // ============================================
  if (window.innerWidth > 1024) {
    const mockups = document.querySelectorAll('.feature-mockup .phone-mockup');
    let parallaxTicking = false;

    const updateParallax = () => {
      const windowHeight = window.innerHeight;

      mockups.forEach(mockup => {
        const rect = mockup.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;

        // How far the element center is from viewport center (-1 to 1)
        const offset = (elementCenter - viewportCenter) / windowHeight;

        // Subtle parallax: max ±25px
        const translateY = offset * -25;

        // Combine with float animation by only setting a CSS variable
        mockup.style.setProperty('--parallax-y', `${translateY}px`);
      });

      parallaxTicking = false;
    };

    // Override float animation to include parallax
    const style = document.createElement('style');
    style.textContent = `
      @media (min-width: 1025px) {
        .feature-mockup .phone-mockup {
          animation: float-parallax 6s ease-in-out infinite;
          --parallax-y: 0px;
        }
        @keyframes float-parallax {
          0%, 100% { transform: translateY(calc(0px + var(--parallax-y))); }
          50% { transform: translateY(calc(-14px + var(--parallax-y))); }
        }
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

});
