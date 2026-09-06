/**
 * Soham Maity - Academic & Theoretical Physics Portfolio
 * Functionality: Scroll-triggered envelope animation, Tab routing, Request Forms, Theme & BibTeX
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initEnvelopeScroll();
  initTabs();
  initBibtexModal();
  initAbstractToggles();
  initRequestForms();
  initProfileImageFallback();
});

function initProfileImageFallback() {
  const profileImg = document.querySelector('.profile-avatar-img');
  if (profileImg) {
    profileImg.addEventListener('error', function handleImgErr() {
      profileImg.removeEventListener('error', handleImgErr);
      if (!profileImg.src.endsWith('profile_placeholder.svg')) {
        profileImg.src = 'assets/profile_placeholder.svg';
      }
    }, { once: true });
  }
}


/* ==========================================================================
   1. Theme Toggle
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

/* ==========================================================================
   2. Scroll-Triggered Envelope Opening Mechanism
   ========================================================================== */
function initEnvelopeScroll() {
  const envelope = document.getElementById('interactive-envelope');
  const scrollCue = document.getElementById('scroll-down-cue');

  function checkEnvelope() {
    if (!envelope) return;
    const rect = envelope.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // As user scrolls down and envelope approaches viewport center
    if (rect.top < windowHeight * 0.75) {
      envelope.classList.add('opened');
    } else {
      envelope.classList.remove('opened');
    }
  }

  window.addEventListener('scroll', checkEnvelope, { passive: true });
  checkEnvelope();

  if (scrollCue && envelope) {
    scrollCue.addEventListener('click', () => {
      envelope.scrollIntoView({ behavior: 'smooth', block: 'center' });
      envelope.classList.add('opened');
    });
  }
}

/* ==========================================================================
   3. Tab Navigation & Deep Linking
   ========================================================================== */
function initTabs() {
  const navLinks = document.querySelectorAll('.nav-link[data-tab]');
  const sections = document.querySelectorAll('.content-section');

  function switchTab(targetTabId, updateHash = true) {
    navLinks.forEach(link => link.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));

    const activeLink = document.querySelector(`.nav-link[data-tab="${targetTabId}"]`);
    const activeSection = document.getElementById(targetTabId);

    if (activeLink && activeSection) {
      activeLink.classList.add('active');
      activeSection.classList.add('active');

      if (updateHash) {
        history.replaceState(null, '', `#${targetTabId}`);
      }

      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([activeSection]);
      }

      // Scroll to content section smoothly if navigating to a specific tab
      if (targetTabId !== 'home') {
        const headerOffset = 75;
        const elementPosition = activeSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.getAttribute('data-tab'));
    });
  });

  document.querySelectorAll('[data-target-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(btn.getAttribute('data-target-tab'));
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      switchTab(hash, false);
    }
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(initialHash)) {
    switchTab(initialHash, false);
  } else {
    switchTab('home', false);
  }
}

/* ==========================================================================
   4. Interactive Request Forms (For CV & Research Proposal)
   ========================================================================== */
function initRequestForms() {
  // 1. CV Request Form
  const cvForm = document.getElementById('cv-request-form');
  if (cvForm) {
    cvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cv-req-name').value;
      const aff = document.getElementById('cv-req-aff').value;
      const email = document.getElementById('cv-req-email').value;
      const purpose = document.getElementById('cv-req-purpose').value;

      const subject = encodeURIComponent(`[CV Request] Official CV Request from ${name} (${aff})`);
      const body = encodeURIComponent(
        `Dear Soham Maity,

I would like to request the full official PDF copy of your Curriculum Vitae.

` +
        `Requester Name: ${name}
` +
        `Affiliation: ${aff}
` +
        `Email: ${email}
` +
        `Purpose: ${purpose}

` +
        `Thank you,
${name}`
      );

      window.location.href = `mailto:ms22119@iisermohali.ac.in?cc=sohammaity55@gmail.com&subject=${subject}&body=${body}`;
      alert(`Thank you, ${name}! Your email client will now open with your formatted CV request addressed to ms22119@iisermohali.ac.in.`);
    });
  }

  // 2. Proposal Request Form
  const propForm = document.getElementById('proposal-request-form');
  if (propForm) {
    propForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('prop-req-name').value;
      const aff = document.getElementById('prop-req-aff').value;
      const email = document.getElementById('prop-req-email').value;
      const comments = document.getElementById('prop-req-comments').value;

      const subject = encodeURIComponent(`[PhD Proposal Request] Inquiry from ${name} (${aff})`);
      const body = encodeURIComponent(
        `Dear Soham Maity,

I am writing to request the complete manuscript of your Doctoral Research Proposal ("Quantum Field Theory in Curved Spacetime and Effective Field Theory Approaches to Quantum Cosmology and Modified Gravity").

` +
        `Reviewer/Professor Name: ${name}
` +
        `Institution/Department: ${aff}
` +
        `Contact Email: ${email}
` +
        `Focus / Notes: ${comments}

` +
        `Best regards,
${name}`
      );

      window.location.href = `mailto:ms22119@iisermohali.ac.in?cc=sohammaity55@gmail.com&subject=${subject}&body=${body}`;
      alert(`Thank you, ${name}! Your email client will now open with your formatted Research Proposal request addressed to ms22119@iisermohali.ac.in.`);
    });
  }
}

/* ==========================================================================
   5. BibTeX Modal
   ========================================================================== */
const BIBTEX_ENTRIES = {
  'teleparallel-horndeski': `@article{Maity:2026th,
  author        = {Maity, Soham and Said, Jackson Levi},
  title         = {Dynamical Systems in Teleparallel analog of Horndeski gravity},
  journal       = {In Preparation (REVTeX Preprint)},
  year          = {2026},
  eprint        = {arXiv:26xx.xxxxx},
  archivePrefix = {arXiv},
  primaryClass  = {gr-qc}
}`,
  'tartu-teleparallel-pert': `@article{Maity:2025tartu,
  author        = {Maity, Soham and Guzmán Monsalve, María José},
  title         = {Cosmological Perturbations in Modified Teleparallel Gravity: Geometrical Formulations and Observational Bounds},
  journal       = {In Preparation},
  year          = {2025}
}`,
  'four-fermi-renorm': `@article{Maity:2024fermi,
  author        = {Maity, Soham},
  title         = {Renormalizability of the Four-Fermi Weak Interaction at One-Loop Level in Four Dimensions},
  journal       = {Term Project Report, IISER Mohali},
  year          = {2024}
}`
};

function initBibtexModal() {
  const modalOverlay = document.getElementById('bibtex-modal');
  const modalCode = document.getElementById('bibtex-code-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const copyBtn = document.getElementById('copy-bibtex-btn');
  let currentKey = '';

  document.querySelectorAll('[data-bibtex-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-bibtex-key');
      if (BIBTEX_ENTRIES[key]) {
        currentKey = key;
        modalCode.textContent = BIBTEX_ENTRIES[key];
        modalOverlay.classList.add('open');
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy BibTeX';
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!currentKey) return;
      navigator.clipboard.writeText(BIBTEX_ENTRIES[currentKey]).then(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy BibTeX', 2000);
      });
    });
  }
}

function initAbstractToggles() {
  document.querySelectorAll('[data-toggle-abstract]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.getElementById(btn.getAttribute('data-toggle-abstract'));
      if (el) {
        el.classList.toggle('open');
        btn.innerHTML = el.classList.contains('open') ? '<i class="fa-solid fa-chevron-up"></i> Hide Abstract' : '<i class="fa-solid fa-align-left"></i> Abstract';
      }
    });
  });
}
