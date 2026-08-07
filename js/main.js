/* ============================================
   Celeste Daily — Executive Portfolio
   JavaScript Engine
   Corrective maintenance release
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const supportsObserver = 'IntersectionObserver' in window;

  // ── Cookie Consent + Google Analytics ──
  // Analytics is never loaded until the visitor actively accepts. Choice is
  // remembered in localStorage so returning visitors aren't asked again.
  const CONSENT_KEY = 'celeste-cookie-consent'; // 'accepted' | 'declined'
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline = document.getElementById('cookie-decline');

  const loadGoogleAnalytics = () => {
    const id = window.GA_MEASUREMENT_ID;
    if (!id || id === 'G-C8ZLL73DG9' || window.__gaLoaded) return;
    window.__gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  };

  const getStoredConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (_error) {
      return null; // localStorage may be blocked (private browsing, etc.)
    }
  };

  const storeConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (_error) {
      // If storage is blocked, the banner will simply reappear next visit.
    }
  };

  const hideConsentBanner = () => {
    cookieBanner?.setAttribute('hidden', '');
  };

  const showConsentBanner = () => {
    cookieBanner?.removeAttribute('hidden');
  };

  window.showCookiePreferences = () => {
    // Exposed globally so a "Cookie Preferences" link (e.g. in the footer)
    // can let a visitor change their mind later, as real consent requires.
    showConsentBanner();
  };

  // The footer button calls this via addEventListener (not an inline
  // onclick) because the site's CSP intentionally blocks inline script
  // execution, including inline event handler attributes.
  document.getElementById('cookie-preferences-link')?.addEventListener('click', () => {
    window.showCookiePreferences();
  });

  const existingConsent = getStoredConsent();
  if (existingConsent === 'accepted') {
    loadGoogleAnalytics();
  } else if (existingConsent !== 'declined') {
    showConsentBanner();
  }

  cookieAccept?.addEventListener('click', () => {
    storeConsent('accepted');
    hideConsentBanner();
    loadGoogleAnalytics();
  });

  cookieDecline?.addEventListener('click', () => {
    storeConsent('declined');
    hideConsentBanner();
  });

  // ── Cinematic Loader ──
  const loader = document.querySelector('.loader');
  let loaderHidden = false;

  const hideLoader = () => {
    if (loaderHidden) return;
    loaderHidden = true;
    loader?.classList.add('hidden');
    loader?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('loading');

    try {
      sessionStorage.setItem('celeste-loader-seen', 'true');
    } catch (_error) {
      // Storage may be disabled; the page remains fully functional.
    }
  };

  let loaderSeen = false;
  try {
    loaderSeen = sessionStorage.getItem('celeste-loader-seen') === 'true';
  } catch (_error) {
    loaderSeen = false;
  }

  if (!loader || loaderSeen || reducedMotion) {
    hideLoader();
  } else {
    const startLoaderExit = () => window.setTimeout(hideLoader, 1850);
    if (document.readyState === 'complete') {
      startLoaderExit();
    } else {
      window.addEventListener('load', startLoaderExit, { once: true });
    }
    // Prevent a slow or failed external resource from trapping the page.
    window.setTimeout(hideLoader, 3500);
  }

  // ── Local Hero Video ──
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo && !reducedMotion) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;

    const playHeroVideo = () => {
      const playAttempt = heroVideo.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
          // The poster remains visible if a browser temporarily blocks autoplay.
        });
      }
    };

    // BUGFIX: this used to wait for the global `window.load` event, which
    // only fires once every image and video on the *entire* page has
    // finished downloading (gallery images, the other 3 videos' metadata,
    // fonts, etc). On anything but a very fast connection that made the
    // hero video sit frozen on its poster frame for several extra seconds
    // even though the video itself was ready much sooner. It now attempts
    // playback immediately, and again as soon as the video reports it has
    // enough data — both cheap, redundant, and not gated on unrelated
    // page weight.
    playHeroVideo();
    heroVideo.addEventListener('loadeddata', playHeroVideo, { once: true });
    heroVideo.addEventListener('canplay', playHeroVideo, { once: true });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && heroVideo.paused) playHeroVideo();
    });
  }


  // ── Viewport videos: play while visible, pause when passed ──
  const viewportVideos = document.querySelectorAll('[data-scroll-video]');

  viewportVideos.forEach((video) => {
    let videoInView = false;

    // Muted autoplay is required by modern browsers. Visitors can enable sound
    // through the native video controls after playback begins.
    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      if (!videoInView || document.hidden) return;

      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
          // Native controls remain available if autoplay is blocked.
        });
      }
    };

    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          videoInView = entry.isIntersecting && entry.intersectionRatio >= 0.45;

          if (videoInView) {
            playVideo();
          } else {
            video.pause();
          }
        });
      }, {
        threshold: [0, 0.25, 0.45, 0.7, 1]
      });

      videoObserver.observe(video);
    } else {
      videoInView = true;
      playVideo();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        video.pause();
      } else {
        playVideo();
      }
    });
  });

  // ── Particles ──
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer && !reducedMotion) {
    const particleCount = window.innerWidth <= 768 ? 20 : 40;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement('div');
      const size = Math.random() * 3 + 1;
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      fragment.appendChild(particle);
    }
    particlesContainer.appendChild(fragment);
  }

  // ── Navigation ──
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  const navLinkItems = document.querySelectorAll('.nav__links a');

  const setMenuOpen = (isOpen) => {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('active', isOpen);
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', isOpen);
  };

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  let navIsScrolled = null; // track state to avoid redundant DOM writes

  const updateNav = () => {
    const isScrolled = window.scrollY > 80;
    nav?.classList.toggle('scrolled', isScrolled);
    if (themeColorMeta && isScrolled !== navIsScrolled) {
      navIsScrolled = isScrolled;
      // Matches .nav.scrolled's translucent white background vs. the
      // transparent/dark background shown before scrolling.
      themeColorMeta.setAttribute('content', isScrolled ? '#ffffff' : '#000000');
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  navToggle?.addEventListener('click', () => {
    setMenuOpen(!navLinks?.classList.contains('active'));
  });

  navLinkItems.forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.querySelector('.nav__logo')?.addEventListener('click', () => setMenuOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks?.classList.contains('active')) {
      setMenuOpen(false);
      navToggle?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setMenuOpen(false);
  }, { passive: true });

  // ── Smooth Scrolling ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;

      const target = document.getElementById(href.slice(1));
      if (!target) return;

      event.preventDefault();
      const offset = 80;
      const position = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: position, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ── Scroll Reveal ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (reducedMotion || !supportsObserver) {
    revealElements.forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  // ── Counter Animation ──
  const statNumbers = document.querySelectorAll('.journey-gallery__stat-number[data-target]');
  const setFinalCounterValue = (element) => {
    const target = Number.parseInt(element.dataset.target || '0', 10);
    const suffix = element.dataset.suffix || '';
    element.textContent = `${Number.isFinite(target) ? target : 0}${suffix}`;
  };

  const animateCounter = (element) => {
    const target = Number.parseInt(element.dataset.target || '0', 10);
    const suffix = element.dataset.suffix || '';
    if (!Number.isFinite(target)) return;

    const duration = 2000;
    const startTime = performance.now();
    const updateCounter = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.floor(eased * target)}${suffix}`;
      if (progress < 1) requestAnimationFrame(updateCounter);
    };
    requestAnimationFrame(updateCounter);
  };

  if (reducedMotion || !supportsObserver) {
    statNumbers.forEach(setFinalCounterValue);
  } else {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach((element) => counterObserver.observe(element));
  }

  // ── Magnetic Buttons ──
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.btn-magnetic').forEach((button) => {
      button.addEventListener('mousemove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ── Modern Filterable Gallery & Lightbox ──
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const galleryFilters = Array.from(document.querySelectorAll('[data-gallery-filter]'));
  const galleryResultCount = document.getElementById('gallery-result-count');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxMedia = document.getElementById('lightbox-media');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDescription = document.getElementById('lightbox-description');
  const lightboxCounter = document.getElementById('lightbox-counter');

  let currentGalleryFilter = 'all';
  let activeGalleryItems = galleryItems.slice();
  let currentImgIndex = 0;
  let lastFocusedElement = null;
  let filterVersion = 0;
  let lightboxTouchStartX = 0;

  const getGalleryItemData = (item) => {
    const image = item?.querySelector('img');
    return {
      src: image?.currentSrc || image?.src || '',
      alt: image?.alt || '',
      category: item?.querySelector('.gallery__category')?.textContent?.trim() || 'Gallery',
      title: item?.dataset.title || item?.querySelector('.gallery__caption')?.textContent?.trim() || 'Gallery image',
      description: item?.dataset.description || ''
    };
  };

  const updateGalleryCount = () => {
    if (!galleryResultCount) return;
    if (currentGalleryFilter === 'all') {
      galleryResultCount.textContent = `Showing all ${activeGalleryItems.length} moments`;
      return;
    }

    const activeButton = galleryFilters.find((button) => button.dataset.galleryFilter === currentGalleryFilter);
    const label = activeButton?.textContent?.trim() || currentGalleryFilter;
    galleryResultCount.textContent = `Showing ${activeGalleryItems.length} ${label.toLowerCase()} moments`;
  };

  const applyGalleryFilter = (filter) => {
    currentGalleryFilter = filter;
    filterVersion += 1;
    const thisVersion = filterVersion;

    galleryFilters.forEach((button) => {
      const selected = button.dataset.galleryFilter === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    galleryItems.forEach((item) => {
      const matches = filter === 'all' || item.dataset.category === filter;

      if (matches) {
        item.hidden = false;
        item.setAttribute('aria-hidden', 'false');
        if (!reducedMotion && typeof item.animate === 'function') {
          item.animate(
            [
              { opacity: 0, transform: 'translateY(12px) scale(0.96)' },
              { opacity: 1, transform: 'translateY(0) scale(1)' }
            ],
            { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
          );
        }
      } else if (!reducedMotion && typeof item.animate === 'function') {
        const animation = item.animate(
          [
            { opacity: 1, transform: 'translateY(0) scale(1)' },
            { opacity: 0, transform: 'translateY(8px) scale(0.96)' }
          ],
          { duration: 180, easing: 'ease-in' }
        );

        animation.finished
          .catch(() => {})
          .then(() => {
            if (thisVersion === filterVersion && currentGalleryFilter === filter) {
              item.hidden = true;
              item.setAttribute('aria-hidden', 'true');
            }
          });
      } else {
        item.hidden = true;
        item.setAttribute('aria-hidden', 'true');
      }
    });

    activeGalleryItems = galleryItems.filter((item) => filter === 'all' || item.dataset.category === filter);
    updateGalleryCount();
  };

  galleryFilters.forEach((button) => {
    button.addEventListener('click', () => {
      applyGalleryFilter(button.dataset.galleryFilter || 'all');
    });
  });

  const updateLightboxControls = () => {
    const hasMultiple = activeGalleryItems.length > 1;
    if (lightboxPrev) lightboxPrev.hidden = !hasMultiple;
    if (lightboxNext) lightboxNext.hidden = !hasMultiple;
  };

  const renderLightboxImage = (animate = true) => {
    const item = activeGalleryItems[currentImgIndex];
    if (!item || !lightboxImg) return;

    const data = getGalleryItemData(item);
    const updateContent = () => {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
      if (lightboxCategory) lightboxCategory.textContent = data.category;
      if (lightboxTitle) lightboxTitle.textContent = data.title;
      if (lightboxDescription) lightboxDescription.textContent = data.description;
      if (lightboxCounter) {
        lightboxCounter.textContent = `${String(currentImgIndex + 1).padStart(2, '0')} / ${String(activeGalleryItems.length).padStart(2, '0')}`;
      }
      updateLightboxControls();
    };

    if (!animate || reducedMotion) {
      updateContent();
      lightboxImg.classList.remove('is-changing');
      return;
    }

    lightboxImg.classList.add('is-changing');
    window.setTimeout(() => {
      updateContent();
      window.requestAnimationFrame(() => lightboxImg.classList.remove('is-changing'));
    }, 150);
  };

  function openLightbox(item) {
    if (!lightbox || !lightboxImg || !activeGalleryItems.length) return;

    const index = activeGalleryItems.indexOf(item);
    currentImgIndex = index >= 0 ? index : 0;
    lastFocusedElement = document.activeElement;
    renderLightboxImage(false);

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose?.focus();
  }

  const closeLightbox = () => {
    if (!lightbox || !lightboxImg) return;

    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');

    window.setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightboxImg.removeAttribute('src');
        lightboxImg.alt = '';
      }
    }, 350);

    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  const showPreviousGalleryImage = () => {
    if (activeGalleryItems.length < 2) return;
    currentImgIndex = (currentImgIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
    renderLightboxImage();
  };

  const showNextGalleryImage = () => {
    if (activeGalleryItems.length < 2) return;
    currentImgIndex = (currentImgIndex + 1) % activeGalleryItems.length;
    renderLightboxImage();
  };

  galleryItems.forEach((item, index) => {
    const title = item.dataset.title || `Gallery image ${index + 1}`;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Open image: ${title}`);

    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  lightboxImg?.addEventListener('error', () => {
    lightboxImg.alt = 'Image unavailable';
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  document.querySelectorAll('[data-lightbox-close]').forEach((element) => {
    element.addEventListener('click', closeLightbox);
  });
  lightboxPrev?.addEventListener('click', showPreviousGalleryImage);
  lightboxNext?.addEventListener('click', showNextGalleryImage);

  lightboxMedia?.addEventListener('touchstart', (event) => {
    lightboxTouchStartX = event.touches[0]?.clientX || 0;
  }, { passive: true });

  lightboxMedia?.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const difference = lightboxTouchStartX - endX;
    if (Math.abs(difference) < 45) return;
    if (difference > 0) showNextGalleryImage();
    else showPreviousGalleryImage();
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('active')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showPreviousGalleryImage();
    if (event.key === 'ArrowRight') showNextGalleryImage();

    if (event.key === 'Tab') {
      const focusable = [lightboxClose, lightboxPrev, lightboxNext].filter(
        (element) => element instanceof HTMLElement && !element.hidden
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  applyGalleryFilter('all');

  // ── Testimonials Slider ──
  const track = document.querySelector('.testimonials__track');
  const dots = Array.from(document.querySelectorAll('.testimonials__dot'));
  let currentSlide = 0;
  let testimonialInterval = null;

  const goToSlide = (index) => {
    if (!track || !dots.length) return;
    currentSlide = Math.max(0, Math.min(index, dots.length - 1));
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentSlide;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };

  const stopTestimonials = () => {
    if (testimonialInterval !== null) {
      window.clearInterval(testimonialInterval);
      testimonialInterval = null;
    }
  };

  const startTestimonials = () => {
    if (!track || dots.length < 2 || testimonialInterval !== null) return;
    testimonialInterval = window.setInterval(() => {
      goToSlide((currentSlide + 1) % dots.length);
    }, 5000);
  };

  const restartTestimonials = () => {
    stopTestimonials();
    startTestimonials();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      restartTestimonials();
    });
  });
  goToSlide(0);
  startTestimonials();

  if (track) {
    let touchStartX = 0;
    track.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0]?.clientX || 0;
      stopTestimonials();
    }, { passive: true });

    track.addEventListener('touchend', (event) => {
      const endX = event.changedTouches[0]?.clientX || 0;
      const difference = touchStartX - endX;
      if (Math.abs(difference) > 60) {
        goToSlide(difference > 0 ? currentSlide + 1 : currentSlide - 1);
      }
      restartTestimonials();
    }, { passive: true });

    // Pause on hover/focus so desktop/mouse users get time to read a slide
    // before it auto-advances (previously only touch interaction paused it).
    track.addEventListener('mouseenter', stopTestimonials);
    track.addEventListener('mouseleave', startTestimonials);
    track.addEventListener('focusin', stopTestimonials);
    track.addEventListener('focusout', startTestimonials);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTestimonials();
    else startTestimonials();
  });

  // ── Back to Top ──
  const backToTop = document.getElementById('back-to-top');
  const updateBackToTop = () => backToTop?.classList.toggle('visible', window.scrollY > 600);
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // ── Company Card Hover Glow ──
  if (finePointer) {
    document.querySelectorAll('.company-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  // ── Active Nav Link Highlight ──
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navAnchors = Array.from(document.querySelectorAll('.nav__links a'));
  const updateActiveNav = () => {
    let current = '';
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 150) current = section.id;
    });
    navAnchors.forEach((anchor) => {
      const active = anchor.getAttribute('href') === `#${current}`;
      if (active) anchor.setAttribute('aria-current', 'page');
      else anchor.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ── Gallery Staggered Reveal ──
  if (reducedMotion || !supportsObserver) {
    galleryItems.forEach((item) => item.classList.add('visible'));
  } else {
    const galleryObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    galleryItems.forEach((item) => galleryObserver.observe(item));
  }

  // ── Performance-safe 3D depth ──
  // Runs only for fine-pointer desktop devices. Animation work is scheduled
  // through requestAnimationFrame and stops completely when the pointer leaves.
  const reportedMemory = Number.parseFloat(String(navigator.deviceMemory || ''));
  const lowPowerDevice = Number.isFinite(reportedMemory) && reportedMemory <= 2;

  if (finePointer && !reducedMotion && !lowPowerDevice) {
    const tiltElements = Array.from(document.querySelectorAll([
      '.journey-gallery__item',
      '.company-card',
      '.value-card',
      '.recognition-card',
      '.contact__card',
      '.featured-video__frame'
    ].join(',')));

    const tiltStates = new Set();
    let tiltAnimationFrame = 0;

    const nearlyEqual = (first, second, tolerance = 0.015) => Math.abs(first - second) <= tolerance;

    const renderTilt = () => {
      let keepAnimating = false;

      tiltStates.forEach((state) => {
        const easing = state.hovered ? 0.2 : 0.14;
        state.currentX += (state.targetX - state.currentX) * easing;
        state.currentY += (state.targetY - state.currentY) * easing;
        state.currentLift += (state.targetLift - state.currentLift) * easing;
        state.currentScale += (state.targetScale - state.currentScale) * easing;
        state.currentGlowX += (state.targetGlowX - state.currentGlowX) * easing;
        state.currentGlowY += (state.targetGlowY - state.currentGlowY) * easing;

        const element = state.element;
        element.style.setProperty('--motion-rx', `${state.currentX.toFixed(3)}deg`);
        element.style.setProperty('--motion-ry', `${state.currentY.toFixed(3)}deg`);
        element.style.setProperty('--motion-lift', `${state.currentLift.toFixed(3)}px`);
        element.style.setProperty('--motion-scale', state.currentScale.toFixed(4));
        element.style.setProperty('--motion-glow-x', `${state.currentGlowX.toFixed(2)}%`);
        element.style.setProperty('--motion-glow-y', `${state.currentGlowY.toFixed(2)}%`);

        const settled =
          nearlyEqual(state.currentX, state.targetX) &&
          nearlyEqual(state.currentY, state.targetY) &&
          nearlyEqual(state.currentLift, state.targetLift) &&
          nearlyEqual(state.currentScale, state.targetScale, 0.0005) &&
          nearlyEqual(state.currentGlowX, state.targetGlowX, 0.08) &&
          nearlyEqual(state.currentGlowY, state.targetGlowY, 0.08);

        if (!settled || state.hovered) {
          keepAnimating = true;
        } else {
          element.classList.remove('is-tilting');
          tiltStates.delete(state);
        }
      });

      tiltAnimationFrame = keepAnimating ? window.requestAnimationFrame(renderTilt) : 0;
    };

    const scheduleTilt = (state) => {
      tiltStates.add(state);
      if (!tiltAnimationFrame) {
        tiltAnimationFrame = window.requestAnimationFrame(renderTilt);
      }
    };

    const resetTilt = (state) => {
      state.hovered = false;
      state.targetX = 0;
      state.targetY = 0;
      state.targetLift = 0;
      state.targetScale = 1;
      state.targetGlowX = 50;
      state.targetGlowY = 50;
      scheduleTilt(state);
    };

    tiltElements.forEach((element) => {
      const isLargeSurface = element.matches('.journey-gallery__item, .featured-video__frame');
      const isMediumSurface = element.matches('.recognition-card, .contact__card');
      const maxTilt = isLargeSurface ? 1.65 : (isMediumSurface ? 2.25 : 3.2);
      const lift = isLargeSurface ? -3.5 : -5.5;
      const scale = isLargeSurface ? 1.003 : 1.008;

      const state = {
        element,
        rect: null,
        hovered: false,
        currentX: 0,
        currentY: 0,
        currentLift: 0,
        currentScale: 1,
        currentGlowX: 50,
        currentGlowY: 50,
        targetX: 0,
        targetY: 0,
        targetLift: 0,
        targetScale: 1,
        targetGlowX: 50,
        targetGlowY: 50
      };

      element.classList.add('motion-3d-card');

      element.addEventListener('pointerenter', () => {
        state.rect = element.getBoundingClientRect();
        state.hovered = true;
        state.targetLift = lift;
        state.targetScale = scale;
        element.classList.add('is-tilting');
        scheduleTilt(state);
      }, { passive: true });

      element.addEventListener('pointermove', (event) => {
        if (!state.hovered) return;
        const rect = state.rect || element.getBoundingClientRect();
        const normalizedX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
        const normalizedY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));

        state.targetX = normalizedY * -maxTilt;
        state.targetY = normalizedX * maxTilt;
        state.targetGlowX = (normalizedX + 1) * 50;
        state.targetGlowY = (normalizedY + 1) * 50;
        scheduleTilt(state);
      }, { passive: true });

      element.addEventListener('pointerleave', () => resetTilt(state), { passive: true });
      element.addEventListener('pointercancel', () => resetTilt(state), { passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      tiltStates.forEach((state) => resetTilt(state));
    });
  }

  // ── Contact Form ──
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-form-status');
  const contactSubmit = document.getElementById('contact-submit');
  const contactSubmitLabel = contactSubmit?.querySelector('.contact__submit-label');

  // Anti-spam: record when the form became interactive. A submission that
  // arrives faster than a human could plausibly read and fill the form is
  // almost always a bot. Combined with the existing honeypot field, this
  // catches both instant scripted submissions and honeypot-avoiding bots
  // without adding a third-party CAPTCHA.
  const contactFormReadyAt = Date.now();
  const MIN_HUMAN_FILL_TIME_MS = 3000;

  const setContactStatus = (message, state = '') => {
    if (!contactStatus) return;
    contactStatus.textContent = message;
    contactStatus.classList.remove('is-success', 'is-error');
    if (state) contactStatus.classList.add(`is-${state}`);
  };

  const setContactSubmitting = (isSubmitting) => {
    if (!contactSubmit) return;
    contactSubmit.disabled = isSubmitting;
    contactSubmit.classList.toggle('is-loading', isSubmitting);
    contactSubmit.setAttribute('aria-busy', String(isSubmitting));
    if (contactSubmitLabel) {
      contactSubmitLabel.textContent = isSubmitting ? 'Sending…' : 'Send Message';
    }
  };

  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setContactStatus('');

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);

    // Spam check: honeypot filled in, or submitted implausibly fast.
    // Bots that fill every field (including the hidden honeypot) or fire
    // submissions instantly are silently "accepted" without actually
    // sending anything — this avoids tipping bots off that they were
    // caught, while keeping Janik's inbox and FormSubmit quota clean.
    const honeypotValue = String(formData.get('_honey') || '').trim();
    const filledInMs = Date.now() - contactFormReadyAt;
    const looksLikeSpam = honeypotValue.length > 0 || filledInMs < MIN_HUMAN_FILL_TIME_MS;

    if (looksLikeSpam) {
      setContactSubmitting(true);
      setContactStatus('Sending your message…');
      window.setTimeout(() => {
        contactForm.reset();
        setContactStatus('Thank you. Your message has been sent successfully.', 'success');
        setContactSubmitting(false);
      }, 600);
      return;
    }

    const subject = String(formData.get('subject') || '').trim() || 'Website enquiry';
    formData.set('_subject', `Website enquiry: ${subject}`);

    setContactSubmitting(true);
    setContactStatus('Sending your message…');

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      let result = null;
      try {
        result = await response.json();
      } catch (_error) {
        result = null;
      }

      const accepted = response.ok && (result?.success === true || result?.success === 'true' || result === null);
      if (!accepted) {
        throw new Error(result?.message || 'The form service could not accept the message.');
      }

      contactForm.reset();
      setContactStatus('Thank you. Your message has been sent successfully.', 'success');
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setContactStatus('Sorry, your message could not be sent. Please try again or email janik@celeste.lk.', 'error');
    } finally {
      setContactSubmitting(false);
    }
  });
});
