const username = 'rodrigohenrik';
const profilePic = document.getElementById('profile-pic');
const userName = document.getElementById('username');
const bio = document.getElementById('bio');
const reposList = document.getElementById('repos-list');

// Função para buscar dados do usuário
async function fetchUserData() {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    profilePic.src = data.avatar_url;
    userName.textContent = data.name || data.login;
    bio.textContent = data.bio || 'No biography available.';
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

// Função para buscar repositórios do usuário
async function fetchUserRepos() {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    const repos = await response.json();
    reposList.innerHTML = repos.map(repo => `
      <div class="repo">
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        <p>${repo.description || 'No description available.'}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching repositories:', error);
  }
}

// Carregar dados ao iniciar
fetchUserData();
fetchUserRepos();
