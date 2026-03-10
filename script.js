/* ════════════════════════════════════════════════════
   NexaGrowth — Main JavaScript
   ════════════════════════════════════════════════════ */

/* ── Loader ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    // Trigger hero animations after loader
    document.querySelectorAll('#hero .reveal-up, #hero .reveal-right').forEach(el => {
      el.classList.add('revealed');
    });
  }, 1800);
});

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  // Back to top
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
});

/* ── Mobile Menu ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Smooth scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Scroll Reveal Animations ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target); // Animate once
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

// Observe all reveal elements except hero (handled after loader)
document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  if (!el.closest('#hero')) {
    revealObserver.observe(el);
  }
});

/* ── Animated Counters ── */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 1800;
  const step = (target / duration) * 16;
  let current = 0;

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ── Portfolio Filter ── */
const filterBtns = document.querySelectorAll('.pf-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    portfolioItems.forEach(item => {
      const category = item.getAttribute('data-category') || '';
      if (filter === 'all' || category.includes(filter)) {
        item.style.display = '';
        item.style.animation = 'fadeIn .4s ease both';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

/* ── Testimonials Slider ── */
const testiTrack = document.getElementById('testiTrack');
const testiDots = document.getElementById('testiDots');
const cards = testiTrack ? testiTrack.querySelectorAll('.testi-card') : [];
let currentSlide = 0;
let autoSlideTimer;

function renderDots() {
  testiDots.innerHTML = '';
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    testiDots.appendChild(dot);
  });
}

function goToSlide(index) {
  currentSlide = (index + cards.length) % cards.length;
  testiTrack.style.transform = `translateX(calc(-${currentSlide * 100}% - ${currentSlide * 24}px))`;
  document.querySelectorAll('.testi-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
  resetAutoSlide();
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

if (testiTrack && cards.length > 0) {
  renderDots();
  document.getElementById('prevBtn')?.addEventListener('click', () => goToSlide(currentSlide - 1));
  document.getElementById('nextBtn')?.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Touch/swipe support
  let startX = 0;
  testiTrack.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  testiTrack.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goToSlide(currentSlide + (diff > 0 ? 1 : -1));
  });

  resetAutoSlide();
}

/* ── Contact Form ── */
async function handleSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('contactForm');
  const submitText = document.getElementById('submitText');
  const submitArrow = document.getElementById('submitArrow');
  const submitLoader = document.getElementById('submitLoader');
  const successMsg = document.getElementById('successMsg');

  // Show loading state
  submitText.textContent = 'Sending…';
  submitArrow.classList.add('hidden');
  submitLoader.classList.remove('hidden');

  // Collect form data
  const formData = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    service: form.service.value,
    message: form.message.value,
    timestamp: new Date().toISOString()
  };

  try {
    /*
     * ══════════════════════════════════════════════════════════════
     * GOOGLE SHEETS INTEGRATION
     * ──────────────────────────────────────────────────────────────
     * To enable real form submission to Google Sheets:
     *
     * 1. Open your Google Sheet
     * 2. Go to Extensions → Apps Script
     * 3. Paste the Apps Script code from README.md
     * 4. Deploy as a Web App (Anyone can access)
     * 5. Copy the Web App URL and paste it below
     * ══════════════════════════════════════════════════════════════
     */
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbye3uGJXAnKKKrQhx0A-95L722PgIiIRt66FwbgNPmWSF9F2cYOVnk1ajq4XBo6rhCl/exec'; // Paste your Google Apps Script Web App URL here

    if (GOOGLE_SHEET_URL) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        mode: 'no-cors' // Required for Google Apps Script
      });
    } else {
      // Demo mode: simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form data (demo mode):', formData);
    }

    // Show success
    form.classList.add('hidden');
    successMsg.classList.remove('hidden');

  } catch (error) {
    console.error('Form submission error:', error);
    // Still show success for better UX (Google Apps Script no-cors won't return readable response)
    form.classList.add('hidden');
    successMsg.classList.remove('hidden');
  }
}

/* ── Newsletter Subscription ── */
function subscribeNewsletter(event) {
  event.preventDefault();
  const input = event.target.querySelector('input');
  const btn = event.target.querySelector('button');

  // Visual feedback
  btn.innerHTML = '✓';
  btn.style.background = '#22C55E';
  input.value = '';
  input.placeholder = 'You\'re subscribed!';

  setTimeout(() => {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btn.style.background = '';
    input.placeholder = 'your@email.com';
  }, 3000);
}

/* ── Back to Top ── */
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Active Nav Link on Scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 200) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}`
      ? '#fff'
      : 'rgba(255,255,255,.75)';
  });
}, { passive: true });

/* ── Parallax subtle effect on hero blobs ── */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const blobs = document.querySelectorAll('.hero-blob');
  blobs.forEach((blob, i) => {
    const speed = (i + 1) * 0.15;
    blob.style.transform = `translateY(${scrollY * speed}px)`;
  });
}, { passive: true });

/* ── Cursor glow effect on service cards ── */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});

/* ── Pricing card tilt effect ── */
document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    const isFeatured = card.classList.contains('pricing-card-featured');
    card.style.transform = isFeatured ? 'scale(1.04)' : '';
  });
});

console.log('%c🚀 NexaGrowth Website Loaded', 'color:#22C55E;font-size:16px;font-weight:bold;');
console.log('%cPremium Digital Marketing Agency Website', 'color:#2563EB;font-size:12px;');