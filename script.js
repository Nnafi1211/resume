// Single-card navigation + theme + mobile dropdown + expandable publications + photo lightbox
(function(){
  const STORAGE_KEY = 'theme';
  const MY_NAME = 'Abdullah Al Nomaan Nafi'; // used to bold your name in author lists

  /* Theme */
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('themeToggle');
    if (btn){
      const isDark = theme === 'dark';
      btn.textContent = isDark ? '🌙' : '☀️';
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }
  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  /* Card switching */
  function setSection(section){
    document.querySelectorAll('.card[data-section]').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-section') === section);
    });
    document.querySelectorAll('nav.nav-links a[data-section]').forEach(a => {
      const active = a.getAttribute('data-section') === section;
      a.setAttribute('aria-selected', String(active));
      a.setAttribute('aria-current', active ? 'page' : 'false');
    });
    const hash = `#${section}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);

    // Close mobile menu on selection
    const nav = document.getElementById('primaryNav');
    const navToggle = document.getElementById('navToggle');
    if (nav && navToggle && nav.classList.contains('open')){
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      navToggle.textContent = '☰';
    }
  }

  /* Nav controls */
  function initNav(){
    const nav = document.getElementById('primaryNav');
    const navToggle = document.getElementById('navToggle');
    if (!nav || !navToggle) return;

    const closeMenu = () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      navToggle.textContent = '☰';
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.textContent = isOpen ? '✕' : '☰';
    });

    nav.querySelectorAll('a[data-section]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setSection(a.getAttribute('data-section'));
      });
    });

    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeMenu(); });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && e.target !== navToggle) closeMenu();
    }, true);
  }

  /* Publications: expandable + bold your name */
  function initPublications(){
    const pubs = document.querySelectorAll('.pub');
    pubs.forEach((pub) => {
      const btn = pub.querySelector('.pub-toggle');
      const authorsSpan = pub.querySelector('.authors-text');
      const abstractSpan = pub.querySelector('.abstract-text');

      // Fill authors + abstract from data attributes
      const authors = (pub.getAttribute('data-authors') || '').trim();
      const abstract = (pub.getAttribute('data-abstract') || '').trim();

      if (authorsSpan){
        const re = new RegExp(`\\b${MY_NAME.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'gi');
        authorsSpan.innerHTML = authors.replace(re, '<strong>$&</strong>');
      }
      if (abstractSpan) abstractSpan.textContent = abstract;

      const open = (wantOpen) => {
        pub.toggleAttribute('open', wantOpen);
        btn.setAttribute('aria-expanded', String(!!wantOpen));
      };

      btn.addEventListener('click', () => open(!pub.hasAttribute('open')));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { open(true); }
        else if (e.key === 'ArrowLeft') { open(false); }
        else if (e.key === 'Escape') { open(false); btn.blur(); }
      });
    });
  }

  /* Photography: lightbox viewer */
  function initLightbox(){
    const grid = document.querySelector('.photo-grid');
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!grid || !lightbox || !img || !closeBtn) return;

    const open = (src, alt) => {
      img.src = src;
      img.alt = alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const close = () => {
      lightbox.classList.remove('open');
      img.src = '';
      document.body.style.overflow = '';
    };

    grid.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.tagName === 'IMG'){
        const full = t.getAttribute('data-full') || t.src;
        open(full, t.alt);
      }
    });

    lightbox.addEventListener('click', (e) => {
      // close if clicking the backdrop (not the image or close button)
      if (e.target === lightbox) close();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* Utilities */
  function initUtilities(){
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
  }

  /* Boot */
  document.addEventListener('DOMContentLoaded', () => {
    initUtilities();
    initNav();
    initPublications();
    initLightbox();

    const saved = localStorage.getItem(STORAGE_KEY);
    applyTheme(saved || document.documentElement.getAttribute('data-theme') || 'dark');

    setSection((location.hash || '#about').slice(1));
    window.addEventListener('hashchange', () => setSection((location.hash || '#about').slice(1)));
  });
})();
