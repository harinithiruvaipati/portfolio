// Custom cursor
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animateCursor() {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  document.querySelectorAll('a, button, input, select, textarea, .project-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      ring.style.width = '60px';
      ring.style.height = '60px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      ring.style.width = '36px';
      ring.style.height = '36px';
    });
  });

  // Nav scroll
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Parallax on hero shapes
  const shapes = document.querySelectorAll('.parallax-shape');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    shapes.forEach(s => {
      const speed = parseFloat(s.dataset.speed) || 0.3;
      s.style.transform = `translateY(${sy * speed}px)`;
    });
  });

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Animate skill bars
        e.target.querySelectorAll('.skill-bar').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => observer.observe(r));

  // Also trigger skill bars when skill cells are revealed
  document.querySelectorAll('.skill-cell').forEach(cell => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const bar = e.target.querySelector('.skill-bar');
          if (bar) setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
        }
      });
    }, { threshold: 0.3 });
    io.observe(cell);
  });

  // Mouse parallax on hero
  document.getElementById('hero').addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 20;
    const cy = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelector('.hero-grid').style.transform = `translate(${cx * 0.3}px, ${cy * 0.3}px)`;
  });


  /* ═══════════ Added features ═══════════ */
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];

  // Scroll progress bar + back-to-top button
  const bar = $('#progress'), toTop = $('#toTop');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    toTop.classList.toggle('show', scrollY > 500);
  }, { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // Active nav link (scroll-spy)
  const links = $$('#nav .nav-links a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => { const on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(sec => spy.observe(sec));
  // close mobile menu after choosing a link
  links.forEach(a => a.addEventListener('click', () => { const m = $('#navMenu'); if (m.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(m).hide(); }));

  // Animated stat counters
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); countIO.unobserve(el);
  }), { threshold: 0.6 });
  $$('.stat-num[data-count]').forEach(el => countIO.observe(el));

  // Projects: category filter + details modal
  const items = $$('.project-item'), count = $('#filterCount');
  const projects = items.map(it => ({
    title: $('.project-title', it).textContent,
    desc: $('.project-desc', it).textContent,
    tags: $$('.tag', it).map(t => t.textContent)
  }));
  function applyFilter(cat) {
    let shown = 0;
    items.forEach(it => { const ok = cat === 'all' || it.dataset.category.split(' ').includes(cat); it.hidden = !ok; if (ok) shown++; });
    count.textContent = `Showing ${shown} of ${items.length} projects`;
  }
  $$('.btn-filter').forEach(b => b.addEventListener('click', () => {
    $$('.btn-filter').forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
    applyFilter(b.dataset.filter);
  }));
  applyFilter('all');
  const modalEl = $('#projectModal'), modal = new bootstrap.Modal(modalEl);
  let lastTrigger = null;
  function openProject(it) {
    const p = projects[+it.dataset.project]; lastTrigger = it;
    $('#projectModalTitle').textContent = p.title;
    $('#projectModalDesc').textContent = p.desc;
    $('#projectModalTags').innerHTML = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
    modal.show();
  }
  items.forEach(it => {
    it.addEventListener('click', () => openProject(it));
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(it); } });
  });
  modalEl.addEventListener('hidden.bs.modal', () => lastTrigger && lastTrigger.focus());

  // Achievements: Fetch API (async/await) with fallback when opened via file://
  const FALLBACK = [{"type": "Achievement", "title": "100+ Problems Solved", "org": "Coding practice", "year": "Ongoing", "desc": "Consistent practice in data structures and algorithms across Python, Java and C++."}, {"type": "Achievement", "title": "10+ Projects Built", "org": "Personal & academic", "year": "Ongoing", "desc": "Full-stack, machine learning and AI-agent projects, from idea to working demo."}, {"type": "Certification", "title": "OpenVSP Ground School", "org": "NASA", "year": "2026"}, {"type": "Certification", "title": "Introduction to Machine Learning", "org": "NPTEL, IIT Madras", "year": "2025"}, {"type": "Certification", "title": "Internet of Things", "org": "NIELT Aurangabad", "year": "2025"}, {"type": "Certification", "title": "Database Structure and Management with MySQL", "org": "Meta", "year": "2025"}, {"type": "Certification", "title": "Google Cybersecurity Professional Certificate", "org": "Google", "year": "2024"}, {"type": "Certification", "title": "Azure AI Fundamentals", "org": "Microsoft", "year": "2024"}];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function renderAchievements(list) {
    const grid = $('#achGrid');
    grid.innerHTML = list.map((a, i) => `
      <div class="col-md-6 col-lg-3 reveal reveal-delay-${(i % 4) + 1}">
        <article class="card ach-card h-100"><div class="card-body">
          <span class="tag">${esc(a.type)}</span>
          <h3 class="ach-title">${esc(a.title)}</h3>
          <div class="ach-meta">${esc(a.org)} · ${esc(a.year)}</div>
          ${a.desc ? `<p class="ach-desc">${esc(a.desc)}</p>` : ''}
        </div></article>
      </div>`).join('');
    $$('.reveal', grid).forEach(r => observer.observe(r));
  }
  async function loadAchievements() {
    const status = $('#achStatus');
    let data;
    try {
      const res = await fetch('assets/data/achievements.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
      status.innerHTML = '';
    } catch (err) {
      console.warn('Fetch failed, using built-in data:', err.message);
      data = FALLBACK;
      status.innerHTML = '<div class="alert alert-warning py-2 small" role="alert">Showing built-in data (JSON could not be fetched — run with a local server to use the file).</div>';
    }
    renderAchievements(data);
  }
  loadAchievements();

  // Contact form: client-side validation
  const form = $('#contactForm'), msg = $('#cMessage'), counter = $('#cMessageCount');
  const rules = {
    cName:    v => v.trim().length >= 2 || 'Please enter your name (at least 2 characters).',
    cEmail:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email, e.g. name@example.com.',
    cSubject: v => v !== '' || 'Please choose a subject.',
    cMessage: v => v.trim().length >= 10 || 'Message must be at least 10 characters.'
  };
  function check(id) {
    const el = document.getElementById(id), r = rules[id](el.value), err = document.getElementById(id + 'Err');
    const ok = r === true;
    el.classList.toggle('is-invalid', !ok); el.classList.toggle('is-valid', ok);
    el.setAttribute('aria-invalid', !ok);
    err.textContent = ok ? '' : r; err.classList.toggle('d-block', !ok);
    return ok;
  }
  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => check(id));
    el.addEventListener('input', () => { if (el.classList.contains('is-invalid')) check(id); });
  });
  msg.addEventListener('input', () => { counter.textContent = `${msg.value.length} / ${msg.maxLength}`; });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = Object.keys(rules).map(check);
    const box = $('#formAlert');
    if (results.includes(false)) {
      box.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert">Please fix the highlighted fields and try again.<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
      form.querySelector('.is-invalid').focus();
      return;
    }
    const name = $('#cName').value.trim(), email = $('#cEmail').value.trim(), subj = $('#cSubject').value, body = msg.value.trim();
    box.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">Thanks, ${esc(name)}! Your email app is opening with the message ready to send.<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
    const url = `mailto:harinithiruvaipati@gmail.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body + '\n\n— ' + name + ' (' + email + ')')}`;
    form.reset(); counter.textContent = '0 / ' + msg.maxLength;
    $$('.is-valid, .is-invalid', form).forEach(x => x.classList.remove('is-valid', 'is-invalid'));
    location.href = url;
  });
