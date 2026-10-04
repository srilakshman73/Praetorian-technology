/**
 * PRAETORIAN TECHNOLOGY — OFFICIAL CLIENT SCRIPT
 * STRATEGY • DATA • INTELLIGENCE • IMPACT
 * Advanced Scroll-Driven Interactions & Animation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initScrollProgress();
  initSideNavigation();
  initCustomCursor();
  initScrollDrivenInteractions();
  initHorizontalProjectShowcase();
  initNavigation();
  initCaseStudyModals();
  initCRMExplorer();
  initGalleryFilter();
  initContactForm();
  initStatCounters();
});

/* ==========================================================================
   01. INTRO / PRELOADER (1-2s Luxury Animation)
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('praetorianPreloader');
  if (!preloader) return;

  const topLine = preloader.querySelector('.top-line');
  const bottomLine = preloader.querySelector('.bottom-line');
  const word1 = preloader.querySelector('.word-1');
  const word2 = preloader.querySelector('.word-2');
  const tagline = preloader.querySelector('.preloader-tagline');

  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    preloader.style.display = 'none';
    return;
  }

  // Animation Sequence
  setTimeout(() => {
    topLine?.classList.add('active');
    bottomLine?.classList.add('active');
  }, 100);

  setTimeout(() => {
    word1?.classList.add('active');
  }, 250);

  setTimeout(() => {
    word2?.classList.add('active');
  }, 500);

  setTimeout(() => {
    tagline?.classList.add('active');
  }, 750);

  // Dismiss Preloader smoothly
  setTimeout(() => {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 600);
  }, 1400);
}

/* ==========================================================================
   02. SCROLL PROGRESS INDICATOR
   ========================================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgressBar');
  if (!progressBar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   03. FLOATING VERTICAL SECTION NAVIGATION (01 - 08)
   ========================================================================== */
function initSideNavigation() {
  const sideNavItems = document.querySelectorAll('.side-nav-item');
  const sections = ['home', 'about', 'services', 'case-studies', 'crm', 'team', 'future', 'contact'];

  if (!sideNavItems.length) return;

  // Smooth click scroll
  sideNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - 40;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active state scroll spy
  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset + 250;
    
    sections.forEach(secId => {
      const sectionEl = document.getElementById(secId);
      if (sectionEl) {
        const top = sectionEl.offsetTop;
        const height = sectionEl.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          sideNavItems.forEach(nav => {
            if (nav.getAttribute('data-section') === secId) {
              nav.classList.add('active');
            } else {
              nav.classList.remove('active');
            }
          });
        }
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   04. CUSTOM LUXURY CURSOR (Desktop Only)
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const circle = document.getElementById('cursorCircle');
  const cursorText = document.getElementById('cursorText');

  if (!dot || !circle || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let circleX = mouseX;
  let circleY = mouseY;
  let isHovered = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  // Smooth circle interpolation via RAF
  function renderCursor() {
    circleX += (mouseX - circleX) * 0.18;
    circleY += (mouseY - circleY) * 0.18;
    circle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Project cards expand cursor with "VIEW"
  const projectTargets = document.querySelectorAll('.cs-card-media, .case-study-card, .gallery-item, .crm-display-frame');
  projectTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      circle.classList.add('cursor-expand-project');
      if (cursorText) cursorText.textContent = 'VIEW';
    });
    el.addEventListener('mouseleave', () => {
      circle.classList.remove('cursor-expand-project');
      if (cursorText) cursorText.textContent = '';
    });
  });

  // Buttons and links
  const buttonTargets = document.querySelectorAll('.btn, .nav-link, .side-nav-item, .service-card-btn, .mobile-menu-toggle');
  buttonTargets.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      circle.classList.add('cursor-hover-btn');
    });
    btn.addEventListener('mouseleave', () => {
      circle.classList.remove('cursor-hover-btn');
    });
  });

  // Hide on leave window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    circle.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    circle.style.opacity = '1';
  });
}

/* ==========================================================================
   05. SCROLL-DRIVEN INTERACTIONS & WORD REVEAL
   ========================================================================== */
function initScrollDrivenInteractions() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const heroContent = document.querySelector('.hero-content');
  const heroImageFrame = document.querySelector('.hero-frame-card');
  const wordRevealContainer = document.getElementById('aboutWordReveal');
  const revealWords = wordRevealContainer ? wordRevealContainer.querySelectorAll('.word-reveal') : [];

  // Word Reveal Observer for About section
  if (wordRevealContainer) {
    const wordObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealWords.forEach((word, idx) => {
            setTimeout(() => {
              word.classList.add('revealed');
            }, idx * 160);
          });
        }
      });
    }, { threshold: 0.35 });

    wordObserver.observe(wordRevealContainer);
  }

  // Scroll loop for parallax and subtle hero scaling
  let lastScrollY = window.pageYOffset;
  let ticking = false;

  window.addEventListener('scroll', () => {
    lastScrollY = window.pageYOffset;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Hero Section Parallax
        if (lastScrollY < window.innerHeight * 1.2) {
          if (heroContent) {
            heroContent.style.transform = `translate3d(0, ${lastScrollY * 0.14}px, 0)`;
          }
          if (heroImageFrame) {
            const scale = 1 + Math.min(lastScrollY * 0.00015, 0.08);
            heroImageFrame.style.transform = `scale(${scale}) translate3d(0, ${-lastScrollY * 0.06}px, 0)`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   06. HORIZONTAL PROJECT SHOWCASE CONTROLS
   ========================================================================== */
function initHorizontalProjectShowcase() {
  const prevBtn = document.getElementById('csPrevBtn');
  const nextBtn = document.getElementById('csNextBtn');
  const dots = document.querySelectorAll('.cs-dot');
  const currentNumEl = document.getElementById('csCounterCurrent');
  const labelEl = document.getElementById('csCounterLabel');
  const cards = document.querySelectorAll('.case-study-card');

  if (!cards.length) return;

  const projectNames = ['BAIRAVA GROUPS', 'CRM WEBSITE', 'BOOK MY SHOP'];
  let activeIndex = 0;

  function updateShowcase(index) {
    activeIndex = (index + cards.length) % cards.length;
    
    // Update dots
    dots.forEach((dot, idx) => {
      if (idx === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update Counter & Label
    if (currentNumEl) currentNumEl.textContent = `0${activeIndex + 1}`;
    if (labelEl) labelEl.textContent = projectNames[activeIndex] || '';

    // Scroll smoothly to target project card
    const targetCard = cards[activeIndex];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      targetCard.style.transition = 'transform 0.4s ease, border-color 0.4s ease';
      targetCard.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        targetCard.style.transform = '';
      }, 400);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => updateShowcase(activeIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => updateShowcase(activeIndex + 1));
  }
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      updateShowcase(idx);
    });
  });
}

/* ==========================================================================
   07. MULTI-PAGE NAVIGATION & PAGE TRANSITIONS (400-600ms)
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navDrawer = document.querySelector('.mobile-nav-drawer');

  // Add initial page-enter animation
  document.body.classList.add('page-enter');

  // Handle bfcache (back-forward navigation)
  window.addEventListener('pageshow', (event) => {
    document.body.classList.remove('page-exit');
    document.body.classList.add('page-enter');
  });

  // Header scroll class
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navDrawer.classList.contains('open');
      if (isOpen) {
        navDrawer.classList.remove('open');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        navDrawer.classList.add('open');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navDrawer.classList.remove('open');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Smooth Multi-Page Navigation Transition Handler
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Check if it's an internal HTML link
    const isInternalPage = href.endsWith('.html') || href.includes('.html#') || href === '/' || href === 'index.html';
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me');
    const isHashOnly = href.startsWith('#');
    const isBlank = link.getAttribute('target') === '_blank';

    if (isInternalPage && !isExternal && !isHashOnly && !isBlank) {
      link.addEventListener('click', (e) => {
        // Allow command/ctrl clicks for new tabs
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        // If target is current page URL without hash, do nothing or scroll top
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const targetPath = href.split('#')[0].split('/').pop() || 'index.html';

        if (currentPath === targetPath && !href.includes('#')) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        e.preventDefault();
        document.body.classList.add('page-exit');

        setTimeout(() => {
          window.location.href = href;
        }, 360);
      });
    }
  });

  // Highlight active link based on current filename
  highlightCurrentPageNav();
}

function highlightCurrentPageNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-list .mobile-nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (!linkHref) return;

    const linkPath = linkHref.split('#')[0].split('/').pop() || 'index.html';

    if (linkPath === currentPath) {
      link.classList.add('active');
    } else if (currentPath === '' && linkPath === 'index.html') {
      link.classList.add('active');
    } else {
      // Don't remove active if statically defined on detail pages
      if (linkPath !== currentPath) {
        link.classList.remove('active');
      }
    }
  });
}

/* ==========================================================================
   08. CASE STUDY DATA & MODAL SYSTEM
   ========================================================================== */
const CASE_STUDIES = {
  bairava: {
    id: 'bairava',
    title: 'Bairava Groups',
    category: 'CORPORATE WEBSITE / BUSINESS PORTFOLIO',
    heroImage: 'assets/images/case_study_bairava.jpg',
    overview: 'A high-level corporate digital presence built for Bairava Groups to unify and showcase their diversified business ventures, flagship projects, and long-standing industry legacy under one prestigious editorial portal.',
    challenge: 'The client required a unified corporate identity that could gracefully present diverse commercial entities—including real estate developments, hospitality portfolios, finance advisory, and infrastructure projects—without sacrificing brand elegance or confusing prospective stakeholders.',
    approach: 'We architected a bespoke digital experience centered on timeless luxury aesthetics, featuring dark charcoal surfaces, radiant metallic gold typography, streamlined navigation, and high-performance interactive galleries.',
    design: 'Editorial typography with Playfair Display and Cinzel, warm ivory backdrops, refined dark presentation modules, and gold foil-inspired visual cues reflecting heritage and corporate stature.',
    development: 'Engineered with lightweight, semantic HTML5, modern modular CSS with custom tokens, smooth interactive portfolio sliders, and optimized responsive layouts ensuring rapid loading speeds across mobile and desktop.',
    keyFeatures: [
      'Multi-Division Corporate Showcase',
      'Interactive Property & Portfolio Media Gallery',
      'Executive Leadership & Heritage Timeline',
      'Direct Business Enquiry & Corporate Routing Flow',
      'Ultra-Fast Responsive Architecture',
      'High-Resolution Optimized Image Pipeline'
    ],
    responsiveExperience: 'Custom-tuned across 320px to 4K ultra-wide screens with fluid typography, adaptive grid scaling, touch-optimized swipe controls, and zero horizontal overflow.',
    technology: ['HTML5', 'CSS3 / Custom Tokens', 'Modern JavaScript (ES6+)', 'REST APIs', 'Cloudflare CDN'],
    status: 'Completed / Production Ready'
  },
  crm: {
    id: 'crm',
    title: 'CRM Website',
    category: 'REAL ESTATE CRM',
    heroImage: 'assets/images/case_study_crm.jpg',
    overview: 'A dedicated, high-performance customer relationship and property management platform engineered specifically for real estate teams to automate lead capture, inventory tracking, site visits, and commercial pipeline reporting.',
    challenge: 'Real estate brokers and property firms frequently struggle with fragmented lead sources, missed follow-ups, static property sheets, and lack of real-time inventory visibility across sales agents.',
    approach: 'We developed an intuitive, modular real-estate operating system comprising 12 specialized business modules, live analytics, automatic lead assignment, and unified calendar scheduling.',
    design: 'Clean, data-dense interface utilizing soft cream backgrounds, deep charcoal cards, high-contrast KPI cards, and clear visual hierarchy for effortless daily operation.',
    development: 'Full-stack modular architecture featuring robust REST APIs, normalized relational database schemas for complex property-lead relationships, role-based authorization, and real-time data export pipelines.',
    keyFeatures: [
      'Lead Lifecycle Management & Auto-Assignment',
      'Interactive Property Inventory & Unit Availability Grid',
      'Appointment Scheduling & Unified Calendar Sync',
      'Customer History & Site Visit Log Tracking',
      'Real-Time Sales Funnel & KPI Analytics Dashboards',
      'One-Click CSV / Excel Data Export'
    ],
    responsiveExperience: 'Dual-optimized for desktop office managers (multi-column wide table views) and field sales agents (mobile-first touch action cards with quick call/WhatsApp integration).',
    technology: ['React / Modern Frontend', 'Python / REST API Engine', 'MySQL Database', 'Chart.js Analytics', 'Docker & Cloud Deployment'],
    status: 'Enterprise Ready / Active Deployment'
  },
  bookmyshop: {
    id: 'bookmyshop',
    title: 'Book My Shop',
    category: 'WEBSITE DEVELOPMENT',
    heroImage: 'assets/images/case_study_bookmyshop.jpg',
    overview: 'A modern commercial marketplace and shop listing portal designed to connect retail entrepreneurs, franchises, and business owners with prime commercial properties, retail booths, and office spaces.',
    challenge: 'Traditional property portals are overly focused on residential apartments, making it difficult for commercial business owners to filter spaces based on footfall, zoning, floor area, and retail category.',
    approach: 'We created a retail-centric property discovery engine featuring instant category filtering (Retail Shops, Office Spaces, Showrooms, Pop-Up Stores), clear pricing models, and simple booking enquiry workflows.',
    design: 'Warm ivory and white marketplace styling with subtle gold and energetic amber CTA highlights, high-clarity property preview cards, and minimal friction discovery flows.',
    development: 'Built with optimized client-side filtering, fast full-text search indexing, dynamic location tags, and direct enquiry forwarding to property owners.',
    keyFeatures: [
      'Commercial Space Search & Faceted Category Filters',
      'Interactive Shop Detail Cards with Dimensions & Pricing',
      'Direct Landlord / Broker Enquiry Routing',
      'Verified Listing Badging & High-Resolution Galleries',
      'Mobile-Optimized Booking & Inquiry Triggers',
      'Scalable Multi-City Architecture'
    ],
    responsiveExperience: 'Engineered with responsive breakpoints ensuring that mobile shop seekers can search, filter, and initiate visits with one-handed ease.',
    technology: ['HTML5', 'Vanilla Modern CSS', 'ES6+ JavaScript', 'MySQL Database', 'REST APIs'],
    status: 'Completed / Production Ready'
  }
};

function initCaseStudyModals() {
  const modalOverlay = document.getElementById('caseStudyModal');
  const modalContainer = modalOverlay ? modalOverlay.querySelector('.modal-content-body') : null;
  const closeBtn = document.getElementById('closeModalBtn');

  if (!modalOverlay || !modalContainer) return;

  // Open triggers
  document.querySelectorAll('[data-case-study]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const studyKey = button.getAttribute('data-case-study');
      const data = CASE_STUDIES[studyKey];
      if (data) {
        renderCaseStudyContent(data, modalContainer);
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close triggers
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCaseStudyContent(data, container) {
    const featureListHTML = data.keyFeatures.map(item => `
      <div class="modal-feature-item" style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
        <svg style="width:16px; height:16px; fill:#C5A059; margin-top:3px; flex-shrink:0;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        <span style="font-size:0.9rem; color:#2A2D30;">${item}</span>
      </div>
    `).join('');

    const techBadgesHTML = data.technology.map(tech => `
      <span class="badge-gold" style="font-size:0.8rem; padding:6px 14px;">${tech}</span>
    `).join('');

    container.innerHTML = `
      <div class="modal-header-section" style="margin-bottom:28px;">
        <span class="badge-gold" style="margin-bottom:12px;">${data.category}</span>
        <h2 style="font-family:var(--font-serif); font-size:clamp(2rem, 3.5vw, 2.8rem); color:var(--text-main); line-height:1.15; margin-bottom:12px;">${data.title}</h2>
        <div style="display:inline-flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:700; color:#15803d; background:rgba(34,197,94,0.1); padding:4px 12px; border-radius:999px; border:1px solid rgba(34,197,94,0.25);">
          <span style="width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
          ${data.status}
        </div>
      </div>

      <div class="modal-hero-visual" style="border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--gold-border); margin-bottom:36px; box-shadow:var(--shadow-md);">
        <img src="${data.heroImage}" alt="${data.title} Presentation" style="width:100%; height:auto; display:block;" />
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:36px; margin-bottom:36px;">
        <div>
          <h3 style="font-family:var(--font-display); font-size:1.1rem; color:var(--gold-700); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.08em;">Project Overview</h3>
          <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.7;">${data.overview}</p>
        </div>
        <div>
          <h3 style="font-family:var(--font-display); font-size:1.1rem; color:var(--gold-700); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.08em;">The Challenge</h3>
          <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.7;">${data.challenge}</p>
        </div>
      </div>

      <div style="background:var(--bg-cream-soft); padding:28px; border-radius:var(--radius-lg); border:1px solid var(--gold-border-subtle); margin-bottom:36px;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; color:var(--gold-700); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.08em;">Our Approach</h3>
        <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.7; margin-bottom:20px;">${data.approach}</p>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; padding-top:16px; border-top:1px solid rgba(197,160,89,0.2);">
          <div>
            <h4 style="font-family:var(--font-sans); font-size:0.9rem; font-weight:700; color:var(--text-main); margin-bottom:6px; text-transform:uppercase;">Design Philosophy</h4>
            <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">${data.design}</p>
          </div>
          <div>
            <h4 style="font-family:var(--font-sans); font-size:0.9rem; font-weight:700; color:var(--text-main); margin-bottom:6px; text-transform:uppercase;">Engineering & Performance</h4>
            <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">${data.development}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom:36px;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; color:var(--gold-700); text-transform:uppercase; margin-bottom:16px; letter-spacing:0.08em;">Key Features</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          ${featureListHTML}
        </div>
      </div>

      <div style="margin-bottom:36px; padding:24px; background:#FFFFFF; border-radius:var(--radius-lg); border:1px solid var(--gold-border-subtle);">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; color:var(--gold-700); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.08em;">Responsive Experience</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.65;">${data.responsiveExperience}</p>
      </div>

      <div style="margin-bottom:36px;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; color:var(--gold-700); text-transform:uppercase; margin-bottom:14px; letter-spacing:0.08em;">Technology Stack</h3>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
          ${techBadgesHTML}
        </div>
      </div>

      <div style="text-align:center; padding-top:20px; border-top:1px solid var(--gold-border-subtle);">
        <a href="#contact" class="btn btn-gold modal-contact-cta" style="padding:14px 36px;">
          Build a Similar Solution with Us
          <svg style="width:16px; height:16px; fill:currentColor;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    `;

    // Modal internal CTA scroll handler
    const ctaBtn = container.querySelector('.modal-contact-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        closeModal();
      });
    }
  }
}

/* ==========================================================================
   09. CRM INTERACTIVE EXPLORER
   ========================================================================== */
function initCRMExplorer() {
  const moduleCards = document.querySelectorAll('.crm-module-card');
  const previewHeadline = document.getElementById('crmPreviewHeadline');
  const previewDesc = document.getElementById('crmPreviewDesc');

  moduleCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const name = card.querySelector('.crm-module-name')?.textContent || 'CRM Module';
      const desc = card.querySelector('.crm-module-desc')?.textContent || '';
      if (previewHeadline && previewDesc) {
        previewHeadline.textContent = `Module Focus: ${name}`;
        previewDesc.textContent = desc;
      }
    });
  });
}

/* ==========================================================================
   10. PROJECT GALLERY FILTER
   ========================================================================== */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = (btn.getAttribute('data-filter') || 'all').toLowerCase();

      galleryItems.forEach(item => {
        const itemCategory = (item.getAttribute('data-category') || '').toLowerCase();
        const categories = itemCategory.split(/\s+/);
        if (filterValue === 'all' || categories.includes(filterValue)) {
          item.style.display = 'block';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   11. PROJECT INQUIRY FORM (REAL BACKEND API SUBMISSION)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const formWrapper = document.getElementById('inquiryFormWrapper');
  const successCard = document.getElementById('inquirySuccessCard');
  const errorBanner = document.getElementById('inquiryErrorBanner');
  const submitBtn = document.getElementById('submitInquiryBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const backToWebsiteBtn = document.getElementById('backToWebsiteBtn');

  if (!form || !submitBtn) return;

  // Real-time clear validation errors on input
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
      clearFieldError(input);
      if (errorBanner) errorBanner.style.display = 'none';
    });
  });

  // Dynamic surprise fields toggle on projectType select change
  const projectTypeSelect = form.querySelector('#projectType');
  const surpriseContainer = form.querySelector('#surpriseFieldsContainer');
  if (projectTypeSelect && surpriseContainer) {
    const handleProjectTypeToggle = () => {
      if (projectTypeSelect.value === 'Surprise Experience Website') {
        surpriseContainer.style.display = 'block';
      } else {
        surpriseContainer.style.display = 'none';
      }
    };
    projectTypeSelect.addEventListener('change', handleProjectTypeToggle);
    // Initial check
    handleProjectTypeToggle();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset error displays
    if (errorBanner) errorBanner.style.display = 'none';
    form.querySelectorAll('.field-error-msg').forEach(msg => msg.remove());
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

    // Extract values
    const nameInput = form.querySelector('#name');
    const companyInput = form.querySelector('#company');
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    const projectTypeInput = form.querySelector('#projectType');
    const budgetInput = form.querySelector('#budget');
    const descriptionInput = form.querySelector('#description');
    const messageInput = form.querySelector('#message');
    const honeypotInput = form.querySelector('#website_hp');

    // Surprise-specific optional inputs
    const surpriseTypeInput = form.querySelector('#surpriseType');
    const surpriseDateInput = form.querySelector('#surpriseDate') || form.querySelector('#targetDate');
    const recipientNameInput = form.querySelector('#recipientName');
    const specialRequirementsInput = form.querySelector('#specialRequirements');

    const name = nameInput?.value.trim() || '';
    const company = companyInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    const projectType = projectTypeInput?.value || 'Web Design & Development';
    const budget = budgetInput?.value || 'Custom Quotation';
    const description = descriptionInput?.value.trim() || '';
    const message = messageInput?.value.trim() || '';
    const honeypot = honeypotInput?.value.trim() || '';

    const surpriseType = surpriseTypeInput?.value || '';
    const surpriseDate = surpriseDateInput?.value.trim() || '';
    const recipientName = recipientNameInput?.value.trim() || '';
    const specialRequirements = specialRequirementsInput?.value.trim() || '';

    // Client-Side Validation
    let hasError = false;

    if (!name || name.length < 2) {
      showFieldError(nameInput, 'Please enter your name.');
      hasError = true;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      hasError = true;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone || phoneDigits.length < 10) {
      showFieldError(phoneInput, 'Please enter a valid phone number.');
      hasError = true;
    }

    if (!message || message.length < 5) {
      showFieldError(messageInput, 'Please describe your project requirements.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Enter Loading State
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    if (submitBtnText) submitBtnText.textContent = 'SENDING INQUIRY...';

    const payload = {
      name,
      company,
      email,
      phone,
      projectType,
      budget,
      projectDescription: description,
      detailedRequirements: message,
      description,
      message,
      surpriseType,
      surpriseDate,
      recipientName,
      specialRequirements,
      website_hp: honeypot
    };

    try {
      const response = await fetch('/api/project-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success === true) {
        // SUCCESS STATE (Only when backend confirms email acceptance)
        if (formWrapper && successCard) {
          formWrapper.style.display = 'none';
          successCard.style.display = 'block';
          successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();
      } else {
        // SERVER REJECTED WITH ERROR (Email failed or invalid fields)
        showServerErrorMessage(result.message || result.error || "We couldn't send your enquiry right now. Please try again or contact us directly.");
      }
    } catch (networkError) {
      console.error('Submission network error:', networkError);
      showServerErrorMessage("We couldn't send your enquiry right now. Please try again or contact us directly.");
    } finally {
      // Restore submit button state
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      if (submitBtnText) submitBtnText.textContent = 'SUBMIT INQUIRY';
    }
  });

  // Handle "BACK TO WEBSITE" / Reset
  if (backToWebsiteBtn) {
    backToWebsiteBtn.addEventListener('click', () => {
      if (formWrapper && successCard) {
        successCard.style.display = 'none';
        formWrapper.style.display = 'block';
        if (errorBanner) errorBanner.style.display = 'none';
      }
    });
  }

  function showFieldError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('has-error');
    
    const existing = inputEl.parentElement?.querySelector('.field-error-msg');
    if (existing) existing.remove();

    const errSpan = document.createElement('span');
    errSpan.className = 'field-error-msg';
    errSpan.textContent = message;
    errSpan.style.cssText = 'color: #dc2626; font-size: 0.75rem; font-weight: 600; margin-top: 4px; display: block;';
    inputEl.parentElement?.appendChild(errSpan);
  }

  function clearFieldError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('has-error');
    const existing = inputEl.parentElement?.querySelector('.field-error-msg');
    if (existing) existing.remove();
  }

  function showServerErrorMessage(msg) {
    if (errorBanner) {
      errorBanner.style.display = 'block';
      const errorMsgEl = errorBanner.querySelector('.error-msg-text');
      if (errorMsgEl) errorMsgEl.textContent = msg;
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/* ==========================================================================
   12. STAT COUNTER ANIMATION
   ========================================================================== */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(num => {
          num.style.transition = 'transform 0.4s ease';
          num.style.transform = 'scale(1.08)';
          setTimeout(() => {
            num.style.transform = 'scale(1)';
          }, 300);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
}
