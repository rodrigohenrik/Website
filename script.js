
const username = 'rodrigohenrik';

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
  }, 1200);

  fetchGitHubData();
});

function fetchGitHubData() {
  fetch(`https://api.github.com/users/${username}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('profile-pic').src = data.avatar_url;
      document.getElementById('username').textContent = data.name || data.login;
      document.getElementById('bio').textContent = data.bio || 'No bio available';
    });

  fetch(`https://api.github.com/users/${username}/repos`)
    .then(res => res.json())
    .then(repos => {
      const reposList = document.getElementById('repos-list');
      const topRepos = repos
        .filter(repo => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

      reposList.innerHTML = topRepos.map(repo => `
        <div class="repo">
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
          <p>${repo.description || 'No description provided.'}</p>
        </div>
      `).join('');
    });
}
