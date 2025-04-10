const username = 'rodrigohenrik';

async function fetchGitHubData() {
  try {
    // Busca dados do perfil
    const profileResponse = await fetch(`https://api.github.com/users/${username}`);
    const profileData = await profileResponse.json();
    document.getElementById('profile-pic').src = profileData.avatar_url;
    document.getElementById('username').innerText = profileData.name || profileData.login;
    document.getElementById('bio').innerText = profileData.bio || 'Desenvolvedor entusiasta de tecnologia.';

    // Busca repositórios
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
    const reposData = await reposResponse.json();
    const reposList = document.getElementById('repos-list');
    reposData.forEach(repo => {
      const repoElement = document.createElement('div');
      repoElement.classList.add('repo');
      repoElement.innerHTML = `
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        <p>${repo.description || 'Sem descrição disponível.'}</p>
      `;
      reposList.appendChild(repoElement);
    });
  } catch (error) {
    console.error('Erro ao buscar dados do GitHub:', error);
  }
}

// Chama a função ao carregar a página
fetchGitHubData();
