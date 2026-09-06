# Soham Maity – Academic & Theoretical Physics Portfolio Website

This repository contains the complete, customized, and fully functional static website for **Soham Maity** (IISER Mohali), designed specifically for a theoretical physics research perspective.

The site is built with pure HTML5, modern CSS3, and vanilla JavaScript, with zero heavy build tools or runtime dependencies. It is completely ready to be hosted on **GitHub Pages** immediately.

---

## 🌟 Researcher-Friendly Features

1. **Academic Tabs Designed for Theoretical Physics**:
   - **About**: Profile, research vision (dilatation symmetry, quintessential inflation), and recent highlights.
   - **Research**: Detailed breakdowns of 4 research pillars ($f(T)/f(Q)$ teleparallel gravity, cosmological perturbations & PBHs, black hole QNMs/QFTCS, and effective field theory/RG flows) and active collaborations (Tartu, Malta, IIT Guwahati/IACS, IIT Mandi).
   - **PhD Proposal**: Full doctoral proposal (*"Quantum Field Theory in Curved Spacetime and Effective Field Theory Approaches to Quantum Cosmology and Modified Gravity"* for Fall 2027) with callout objectives, methodology pillars, timeline, and direct PDF download.
   - **Manuscripts**: Working papers and preprints (including *Dynamical Systems in Teleparallel analog of Horndeski gravity*), abstract toggles, and interactive **Copy BibTeX** modal.
   - **Talks & Events**: Filterable timeline of seminars, international conferences (NUS, Tartu, Mississippi, Perimeter Institute, YITP Kyoto, ICTS-TIFR), and research visits.
   - **Curriculum Vitae (CV)**: Interactive digital CV, printable styling (`Ctrl+P`), and direct download button for the compiled PDF.
   - **Code & Notes**: Links to Mathematica phase-space routines, Cadabra scripts, PyCBC workflows, and Substack physics essays.
   - **Contact**: Academic affiliation at IISER Mohali, emails, and pre-formatted inquiry form.

2. **Theoretical Physics Specifics**:
   - **LaTeX Math Rendering via MathJax v3**: Native rendering of theoretical symbols ($f(T)$, $f(Q)$, $\Lambda\text{CDM}$, $c_T = c$, $\langle T_{\mu\nu} \rangle_{\text{ren}}$, etc.).
   - **One-Click BibTeX Export**: Modal popover for easy citation by peers and collaborators.
   - **Dark / Light Mode**: High-contrast dark theme optimized for long reading sessions, with automatic OS preference detection and `localStorage` persistence.
   - **Print-to-PDF Friendly**: Custom print stylesheets format the CV directly without navigation bars or clutter.

---

## 🚀 How to Publish to GitHub Pages (2-Minute Setup)

### Step 1: Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. For a personal user site, name the repository:
   ```text
   Galaxy9932.github.io
   ```
   *(Or choose any name such as `academic-website`)*.
3. Make sure the repository is **Public**.

### Step 2: Initialize Git and Push from your Terminal
Open your terminal in this directory (`website/`) and execute:

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit the website
git commit -m "Initial commit: Soham Maity academic research website"

# 4. Set branch to main
git branch -M main

# 5. Link your GitHub remote repository
git remote add origin https://github.com/Galaxy9932/Galaxy9932.github.io.git

# 6. Push to GitHub
git push -u origin main
```

### Step 3: Activate GitHub Pages
- If your repo is named `Galaxy9932.github.io`, GitHub Pages is automatically published at `https://galaxy9932.github.io/`.
- If your repo has another name (e.g., `academic-website`):
  1. Open your repository on GitHub.
  2. Navigate to **Settings** > **Pages** (left sidebar).
  3. Under **Branch**, select `main` branch and `/ (root)` folder.
  4. Click **Save**.
  5. Your site will be live at `https://galaxy9932.github.io/academic-website/`.

---

## 📁 Repository Directory Structure

```text
website/
├── index.html                     # Main interactive page with all academic tabs
├── README.md                      # Deployment guide and documentation
├── css/
│   └── style.css                  # Custom styling (light/dark theme, academic typography, print styles)
├── js/
│   └── script.js                  # Tab switching, BibTeX modal, theme toggle, search filters
└── assets/
    ├── Soham_Maity_CV.pdf          # Clean, high-resolution compiled CV PDF
    └── Soham_Maity_PhD_Proposal.pdf# Clean, high-resolution compiled PhD Research Proposal PDF
```

---

## ⚙️ Customization & Updating
- **Adding new publications**: In `index.html`, copy a `<article class="publication-item">` block and add its BibTeX entry to `BIBTEX_ENTRIES` inside `js/script.js`.
- **Adding new talks/conferences**: Add a `<div class="timeline-item talk-item">` block inside the Talks section in `index.html`.
- **Custom Domain**: You can connect a custom domain (e.g., `sohammaity.com`) in **Settings** > **Pages** > **Custom domain** on GitHub.

