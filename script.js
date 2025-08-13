/* ===================== Utilidades ===================== */
const $ = (q, c = document) => c.querySelector(q);
const $$ = (q, c = document) => Array.from(c.querySelectorAll(q));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===================== Tema com persistência ===================== */
const THEME_KEY = 'rh-theme';
const body = document.body;
const themeBtn = $('.theme-toggle');

function setTheme(mode) {
  body.dataset.theme = mode; // aplica data-theme ao <body>
  themeBtn.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
  themeBtn.textContent = mode === 'light' ? '🌞' : '🌙';
  localStorage.setItem(THEME_KEY, mode);
}
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY)
    || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(current === 'light' ? 'dark' : 'light');
}
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) setTheme(saved);
  else setTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
})();
themeBtn.addEventListener('click', toggleTheme);

/* ===================== Menu mobile ===================== */
const nav = $('.site-nav');
const navToggle = $('.nav-toggle');
navToggle?.addEventListener('click', () => {
  const open = nav.getAttribute('data-open') === 'true';
  nav.setAttribute('data-open', String(!open));
  navToggle.setAttribute('aria-expanded', String(!open));
});

/* ===================== Scroll spy ===================== */
const navLinks = $$('a[data-nav]');
const sections = navLinks.map(a => $(a.getAttribute('href')));
const header = $('[data-header]');
const SPY_OFFSET = 72;

const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const id = '#' + entry.target.id;
    const link = navLinks.find(a => a.getAttribute('href') === id);
    if (link && entry.isIntersecting) {
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'true');
    }
  });
}, { rootMargin: `-${SPY_OFFSET}px 0px -60% 0px`, threshold: 0.1 });
sections.forEach(sec => sec && spy.observe(sec));

/* ===================== Voltar ao topo ===================== */
const scrollTop = $('.scroll-top');
function onScroll() {
  const y = window.scrollY || window.pageYOffset;
  if (y > 480) scrollTop.classList.add('is-visible');
  else scrollTop.classList.remove('is-visible');

  header.style.boxShadow = y > 4 ? '0 6px 16px rgba(0,0,0,.15)' : 'none';
}
let ticking = false;
window.addEventListener('scroll', () => {
  if (prefersReduced) return onScroll();
  if (!ticking) {
    window.requestAnimationFrame(() => { onScroll(); ticking = false; });
    ticking = true;
  }
});
scrollTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
});

/* ===================== Reveal on view ===================== */
const reveals = $$('.section, .card, .project-card');
reveals.forEach(el => el.classList.add('reveal'));
const revObs = new IntersectionObserver(es => {
  es.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      target.classList.add('is-visible');
      revObs.unobserve(target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => revObs.observe(el));

/* ===================== Newsletter feedback ===================== */
const form = $('#mc-form');
const msg = $('.form-msg');
form?.addEventListener('submit', (e) => {
  const email = $('#email').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    e.preventDefault();
    msg.textContent = 'Por favor, insira um e-mail válido.';
    msg.style.color = 'tomato';
    $('#email').focus();
    return;
  }
  msg.textContent = 'Quase lá! Abrimos a página de confirmação.';
  msg.style.color = 'inherit';
});

/* ===================== Ano dinâmico ===================== */
$('#year').textContent = new Date().getFullYear();

/* ===================== Repositórios do GitHub ===================== */
/* Troque GITHUB_USER pelo seu username (ex.: 'cyb3rxhkr') */
(async function githubRepos() {
  const USER = 'GITHUB_USER';
  const CACHE_KEY = `gh-repos:${USER}`;
  const CACHE_TTL = 1000 * 60 * 30; // 30 min

  const grid = document.getElementById('repo-grid');
  const msg  = document.getElementById('repo-msg');
  const q    = document.getElementById('repo-search');
  const langSel = document.getElementById('repo-lang');
  const sortSel = document.getElementById('repo-sort');

  const showSkeletons = (n=6) => {
    grid.innerHTML = '';
    for (let i=0;i<n;i++){
      const s = document.createElement('article');
      s.className = 'project-card skeleton';
      s.style.height = '120px';
      grid.appendChild(s);
    }
  };

  const getCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) return null;
      return data;
    } catch { return null; }
  };
  const setCache = (data) => localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));

  async function fetchAllRepos() {
    const perPage = 100;
    const url = `https://api.github.com/users/${USER}/repos?per_page=${perPage}&sort=updated`;
    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' }});
    if (res.status === 403) {
      const rl = res.headers.get('x-ratelimit-remaining');
      if (rl === '0') throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.');
    }
    if (!res.ok) throw new Error('Falha ao buscar repositórios.');
    return res.json();
  }

  const langColor = (lang) => {
    const map = {
      'JavaScript':'#f1e05a','TypeScript':'#3178c6','Python':'#3572A5','Go':'#00ADD8','Rust':'#dea584',
      'HTML':'#e34c26','CSS':'#563d7c','Shell':'#89e051','Java':'#b07219','C#':'#178600','C++':'#f34b7d'
    };
    const c = map[lang] || '#999';
    return `<span class="repo-lang-badge" style="border-color:${c};">${lang}</span>`;
  };

  let repos = [];
  function render(list) {
    const visible = list.filter(r => !r.archived && !r.fork);
    if (!visible.length) {
      grid.innerHTML = '';
      msg.textContent = 'Nenhum repositório encontrado com os filtros atuais.';
      return;
    }
    msg.textContent = '';
    grid.innerHTML = '';
    visible.forEach(r => {
      const stars = r.stargazers_count.toLocaleString();
      const lang  = r.language ? langColor(r.language) : '';
      const desc  = r.description ? r.description : 'Sem descrição.';
      const upd   = new Date(r.updated_at).toLocaleDateString();
      const card = document.createElement('article');
      card.className = 'project-card';
      card.innerHTML = `
        <h3>${r.name} ${lang}</h3>
        <p>${desc}</p>
        <p class="subtle">★ ${stars} · Atualizado em ${upd}</p>
        <div>
          <a class="project-link" href="${r.html_url}" target="_blank" rel="noopener">Código</a>
          ${r.homepage ? `<a class="project-link" href="${r.homepage}" target="_blank" rel="noopener">Demo</a>` : ''}
        </div>`;
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const term = q.value.trim().toLowerCase();
    const lang = langSel.value;
    const sort = sortSel.value;

    let list = [...repos];
    if (term) {
      list = list.filter(r =>
        (r.name && r.name.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term))
      );
    }
    if (lang) list = list.filter(r => r.language === lang);

    if (sort === 'stars') list.sort((a,b) => b.stargazers_count - a.stargazers_count);
    else if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
    else list.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));

    render(list);
  }

  try {
    showSkeletons();
    repos = getCache() || await fetchAllRepos();
    setCache(repos);

    const langs = Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort();
    langs.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l; opt.textContent = l; langSel.appendChild(opt);
    });

    applyFilters();
  } catch (e) {
    grid.innerHTML = '';
    msg.textContent = e.message || 'Erro ao carregar repositórios.';
  }

  q.addEventListener('input', applyFilters);
  langSel.addEventListener('change', applyFilters);
  sortSel.addEventListener('change', applyFilters);
})();
