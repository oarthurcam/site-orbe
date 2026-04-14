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
  const fadeElements = document.querySelectorAll('.fade-up');

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
