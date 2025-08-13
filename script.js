/* Utilidades */
const $ = (q, c = document) => c.querySelector(q);
const $$ = (q, c = document) => Array.from(c.querySelectorAll(q));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Tema: persistência com localStorage */
const THEME_KEY = 'rh-theme';
const body = document.body;
const themeBtn = $('.theme-toggle');

function setTheme(mode) {
  body.dataset.theme = mode; // data-theme para CSS custom props, se desejar
  themeBtn.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
  themeBtn.textContent = mode === 'light' ? '🌞' : '🌙';
  localStorage.setItem(THEME_KEY, mode);
}
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(current === 'light' ? 'dark' : 'light');
}
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) setTheme(saved);
  else setTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
})();
themeBtn.addEventListener('click', toggleTheme);

/* Menu mobile */
const nav = $('.site-nav');
const navToggle = $('.nav-toggle');
navToggle?.addEventListener('click', () => {
  const open = nav.getAttribute('data-open') === 'true';
  nav.setAttribute('data-open', String(!open));
  navToggle.setAttribute('aria-expanded', String(!open));
});

/* Scroll spy (destaca link ativo) */
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

/* Botão voltar ao topo */
const scrollTop = $('.scroll-top');
function onScroll() {
  const y = window.scrollY || window.pageYOffset;
  if (y > 480) scrollTop.classList.add('is-visible');
  else scrollTop.classList.remove('is-visible');

  // Header shadow sutil ao rolar
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

/* Revelar seções ao entrar na viewport */
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

/* Newsletter (validação básica + mensagem de feedback) */
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
  // Para Mailchimp (target=_blank), exibimos feedback otimista:
  msg.textContent = 'Quase lá! Abrimos a página de confirmação.';
  msg.style.color = 'var(--text)';
});

/* Ano dinâmico no rodapé */
$('#year').textContent = new Date().getFullYear();
