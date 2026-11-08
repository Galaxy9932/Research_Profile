// Page controls are independent of the decorative WebGL renderer.
const themeButton = document.querySelector('#theme-toggle-btn');
let theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
try {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') theme = savedTheme;
} catch {
  // Theme switching still works when storage is disabled.
}
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}
applyTheme();
themeButton.hidden = false;
themeButton.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Keep the new theme for this visit.
  }
});

const navigation = document.querySelectorAll('.nav-link');
function updateCurrentSection() {
  const target = location.hash || '#home';
  for (const link of navigation) {
    if (link.hash === target) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', updateCurrentSection);
updateCurrentSection();

for (const button of document.querySelectorAll('[data-toggle-abstract]')) {
  const abstract = document.getElementById(button.dataset.toggleAbstract);
  abstract.hidden = true;
  button.hidden = false;
  button.addEventListener('click', () => {
    abstract.hidden = !abstract.hidden;
    button.setAttribute('aria-expanded', String(!abstract.hidden));
    button.textContent = abstract.hidden ? 'Abstract' : 'Hide abstract';
  });
}

const requestSubjects = {
  'cv-request-form': 'Curriculum vitae request',
  'proposal-request-form': 'Doctoral research proposal request',
};
for (const [id, subject] of Object.entries(requestSubjects)) {
  const form = document.getElementById(id);
  form.hidden = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const details = data.get('Request_Purpose') || data.get('Research_Interest');
    const body = [
      'Dear Soham Maity,',
      '',
      'I would like to request a copy of your ' + subject.replace(' request', '').toLowerCase() + '.',
      '',
      'Name: ' + data.get('Requester_Name'),
      'Affiliation: ' + data.get('Affiliation'),
      'Email: ' + data.get('Requester_Email'),
      'Details: ' + details,
    ].join('\r\n');
    location.href = 'mailto:ms22119@iisermohali.ac.in?cc=sohammaity55@gmail.com'
      + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
}

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


const citation = document.querySelector('#bibtex-modal');
const citationText = document.querySelector('#bibtex-code-content');
const copyStatus = document.querySelector('#copy-status');

for (const button of document.querySelectorAll('[data-bibtex-key]')) {
  button.hidden = false;
  button.addEventListener('click', () => {
    citationText.textContent = BIBTEX_ENTRIES[button.dataset.bibtexKey];
    copyStatus.textContent = '';
    citation.showModal();
  });
}
document.querySelector('#modal-close-btn').addEventListener('click', () => citation.close());
document.querySelector('#copy-bibtex-btn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(citationText.textContent);
    copyStatus.textContent = 'Citation copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(citationText);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Citation selected. Use the copy command on your device.';
  }
});
