// Toggle light/dark mode
const themeToggle = document.createElement('toggle');
themeToggle.className = 'theme-toggle';
themeToggle.innerText = '🔆';
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});
document.body.appendChild(themeToggle);

// Scroll to top button
const scrollBtn = document.createElement('a');
scrollBtn.href = '#';
scrollBtn.className = 'scroll-top';
scrollBtn.innerText = '↑';
document.body.appendChild(scrollBtn);

// Optional: Show scroll-top button only after scrolling a bit
window.addEventListener('scroll', () => {
  scrollBtn.style.opacity = window.scrollY > 300 ? '1' : '0';
});
