// script.js

const username = 'rodrigohenrik';
const profilePic = document.getElementById('profile-pic');
const userName = document.getElementById('username');
const bio = document.getElementById('bio');
const reposList = document.getElementById('repos-list');
const container = document.querySelector('.container');
const loader = document.getElementById('loader');

// Inicializa animações AOS
AOS.init();

// Efeito de digitação para o título
function typingEffect(text, element, speed = 100) {
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// Exibe os dados do usuário
async function fetchUserData() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    const data = await res.json();
    profilePic.src = data.avatar_url;
    typingEffect(data.name || data.login, userName);
    bio.textContent = data.bio || 'Desenvolvedor apaixonado por tecnologia.';
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
  }
}

// Lista os repositórios do GitHub
async function fetchUserRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
    const repos = await res.json();
    reposList.innerHTML = repos.map(repo => `
      <div class="repo" data-aos="fade-up">
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        <p>${repo.description || 'Sem descrição.'}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao buscar repositórios:', error);
  }
}

// Delay de carregamento + inicia tudo
setTimeout(() => {
  loader.style.display = 'none';
  container.style.display = 'block';
  fetchUserData();
  fetchUserRepos();
}, 1800);
