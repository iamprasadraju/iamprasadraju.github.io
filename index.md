---
layout: page
---

<img src="assets/pp.png" alt="Prasad Raju G" width="160" style="margin: 0 auto 24px auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 4px;">


I’m currently engaged in independent AI research - studying ML/DL algorithms, implementing models in Python and PyTorch, reproducing research papers from arXiv, and building projects on GitHub. My work sits at the intersection of applied mathematics, deep learning, and systems engineering.

My curiosity spans across science and technology - from Computer Science and Mathematics to Physics, Chemistry, and Biology - all driven by one fundamental question: How does the Universe work?

When I’m not writing code, you’ll find me reading research papers, exploring quantum mechanics, or diving into neuroscience - always chasing that fundamental question.

<style>
  .gh-quote {
    padding: 16px;
    background-color: #f6f8fa;
    border-left: 4px solid #40c463;
    border-radius: 4px;
    font-style: italic;
    color: #57606a;
    margin-top: 24px;
    margin-bottom: 32px;
  }
  .gh-quote-author {
    font-weight: 600;
    color: #24292f;
  }
  @media (prefers-color-scheme: dark) {
    .gh-quote {
      background-color: #161b22;
      border-left: 4px solid #238636;
      color: #8b949e;
    }
    .gh-quote-author {
      color: #c9d1d9;
    }
  }
  
  html[data-theme='dark'] .gh-quote,
  html[data-theme='solarized-dark'] .gh-quote {
    background-color: #161b22;
    border-left: 4px solid #238636;
    color: #8b949e;
  }
  
  html[data-theme='dark'] .gh-quote-author,
  html[data-theme='solarized-dark'] .gh-quote-author {
    color: #c9d1d9;
  }
  
  html[data-theme='style'] .gh-quote,
  html[data-theme='classic'] .gh-quote,
  html[data-theme='solarized-light'] .gh-quote {
    background-color: #f6f8fa;
    border-left: 4px solid #40c463;
    color: #57606a;
  }
  
  html[data-theme='style'] .gh-quote-author,
  html[data-theme='classic'] .gh-quote-author,
  html[data-theme='solarized-light'] .gh-quote-author {
    color: #24292f;
  }
</style>

<div class="gh-quote">
  "The light that found me in the night I was lost." <span class="gh-quote-author">— @GeorgeHotz</span>
</div>

### Skills

`Python` &nbsp;&nbsp; `C++` &nbsp;&nbsp; `C` &nbsp;&nbsp; `Applied Mathematics` &nbsp;&nbsp; `Machine Learning` &nbsp;&nbsp; `Deep Learning` &nbsp;&nbsp; `System Design` &nbsp;&nbsp; `Performance Engineering` &nbsp;&nbsp; `Computer Vision` &nbsp;&nbsp;
{: style="line-height: 2.2;" }

### Interests

`Artificial Intelligence` &nbsp;&nbsp; `Game Theory` &nbsp;&nbsp; `Quantum Physics` &nbsp;&nbsp; `Neuroscience` &nbsp;&nbsp; `Bioinformatics` &nbsp;&nbsp; `Cryptography` &nbsp;&nbsp; `Robotics` &nbsp;&nbsp; `Quant Finance`
{: style="line-height: 2.2;" }

---

<h3 style="margin-top: 24px;">Contribution Activity</h3>
<img src="https://ghchart.rshah.org/iamprasadraju" alt="iamprasadraju's Github chart" style="margin-top: 16px; margin-bottom: 24px; width: 100%; display: block;" />

<div id="github-activity">
  <p style="color: #828282; font-size: 14px;">Loading actual GitHub activity...</p>
</div>

<script>
  (async function fetchGitHubActivity() {
    try {
      const urls = [
        'https://api.github.com/users/iamprasadraju/events/public?per_page=100&page=1',
        'https://api.github.com/users/iamprasadraju/events/public?per_page=100&page=2',
        'https://api.github.com/users/iamprasadraju/events/public?per_page=100&page=3'
      ];
      
      const responses = await Promise.all(urls.map(url => fetch(url).catch(() => null)));
      
      let events = [];
      for (const res of responses) {
        if (res && res.ok) {
          const data = await res.json();
          events = events.concat(data);
        }
      }
      
      if (events.length === 0) throw new Error('API Rate Limit or Error');
      
      const today = new Date();
      const currentDayHeader = today.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
      const commitCounts = {};
      
      events.forEach(event => {
        if (event.type === 'PushEvent') {
          const eventDate = new Date(event.created_at);
          if (eventDate.toDateString() === today.toDateString()) {
            const repoName = event.repo.name;
            const commitCount = event.payload.size ? event.payload.size : (event.payload.commits ? event.payload.commits.length : 1);
            if (commitCount > 0) {
              commitCounts[repoName] = (commitCounts[repoName] || 0) + commitCount;
            }
          }
        }
      });

      const container = document.getElementById('github-activity');
      container.innerHTML = `<h4 style="margin-bottom: 15px; color: #828282; font-size: 16px; font-weight: normal; border-bottom: 1px solid #eee; padding-bottom: 8px;">${currentDayHeader}</h4>`;
      
      if (Object.keys(commitCounts).length === 0) {
        container.innerHTML += '<p style="color: #828282; font-size: 14px;">No public commits found today.</p>';
        return;
      }

      const ul = document.createElement('ul');
      ul.className = 'post-list';
      ul.style.listStyle = 'none';
      ul.style.marginLeft = '0';
      ul.style.paddingLeft = '0';

      const totalCommits = Object.values(commitCounts).reduce((a, b) => a + b, 0);

      for (const [repo, count] of Object.entries(commitCounts).sort((a,b) => b[1] - a[1])) {
        const li = document.createElement('li');
        li.style.marginBottom = '16px';
        const commitText = count === 1 ? '1 commit' : `${count} commits`;
        const percentage = Math.round((count / totalCommits) * 100);
        
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: 16px; font-weight: 600;">
              <a href="https://github.com/${repo}" target="_blank" style="text-decoration: none; color: #2a7ae2;">${repo}</a>
            </h4>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #828282; font-size: 14px;">${commitText}</span>
              <div style="width: 60px; height: 8px; background-color: #ebedf0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background-color: #40c463; width: ${percentage}%;"></div>
              </div>
            </div>
          </div>
        `;
        ul.appendChild(li);
      }
      
      container.appendChild(ul);
    } catch (error) {
      document.getElementById('github-activity').innerHTML = '<p style="color: #828282; font-size: 14px;">Unable to load GitHub activity at this time.</p>';
      console.error('GitHub Activity Error:', error);
    }
  })();
</script>
