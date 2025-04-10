const username = 'rodrigohenrik';

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
  }, 1500);

  fetchGitHubData();
});

function fetchGitHubData() {
  fetch(`https://api.github.com/users/${username}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('profile-pic').src = data.avatar_url;
      document.querySelector('.typing').textContent = data.name || data.login;
      document.getElementById('bio').textContent = data.bio || '';
    });

  fetch(`https://api.github.com/users/${username}/repos`)
    .then(res => res.json())
    .then(repos => {
      const reposList = document.getElementById('repos-list');
      reposList.innerHTML = repos.slice(0, 6).map(repo => `
        <div class="repo">
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
          <p>${repo.description || 'Sem descrição disponível.'}</p>
        </div>
      `).join('');
    });
}