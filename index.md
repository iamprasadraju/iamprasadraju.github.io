---
layout: page
---

<img src="assets/pp.png" alt="Prasad Raju G" width="160" style="margin: 0 auto 24px auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 4px;">


I’m currently engaged in independent AI research - studying ML/DL algorithms, implementing models in Python and PyTorch, reproducing research papers from arXiv, and building projects on GitHub. My work sits at the intersection of applied mathematics, deep learning, and systems engineering.

My curiosity spans across science and technology - from Computer Science and Mathematics to Physics, Chemistry, and Biology - all driven by one fundamental question: How does the Universe work?

When I’m not writing code, you’ll find me reading research papers, exploring quantum mechanics, or diving into neuroscience - always chasing that fundamental question.

<style>
  .commit-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .commit-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
  }

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
          <div class="commit-row">
            <h4 style="margin: 0; font-size: 16px; font-weight: 600; min-width: 0; overflow-wrap: break-word;">
              <a href="https://github.com/${repo}" target="_blank" style="text-decoration: none; color: #2a7ae2;">${repo}</a>
            </h4>
            <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
              <span style="color: #828282; font-size: 14px; white-space: nowrap;">${commitText}</span>
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

### Special Thanks

<style>
.thanks-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 32px;
}
.thanks-badge {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(42, 122, 226, 0.1);
  color: #2a7ae2 !important;
  border: 1px solid rgba(42, 122, 226, 0.2);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(15px);
}
.thanks-badge:hover {
  background: #2a7ae2;
  color: #fff !important;
  text-decoration: none;
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 6px 12px rgba(42, 122, 226, 0.25);
}

/* Staggered load animation */
.thanks-badge:nth-child(1) { animation-delay: 0.1s; }
.thanks-badge:nth-child(2) { animation-delay: 0.2s; }
.thanks-badge:nth-child(3) { animation-delay: 0.3s; }
.thanks-badge:nth-child(4) { animation-delay: 0.4s; }
.thanks-badge:nth-child(5) { animation-delay: 0.5s; }
.thanks-badge:nth-child(6) { animation-delay: 0.6s; }
.thanks-badge:nth-child(7) { animation-delay: 0.7s; }
.thanks-badge:nth-child(8) { animation-delay: 0.8s; }
.thanks-badge:nth-child(9) { animation-delay: 0.9s; }
.thanks-badge:nth-child(10) { animation-delay: 1.0s; }

@keyframes floatIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark Theme Sync */
html[data-theme='dark'] .thanks-badge,
html[data-theme='solarized-dark'] .thanks-badge {
  background: rgba(79, 156, 249, 0.1);
  color: #4f9cf9 !important;
  border-color: rgba(79, 156, 249, 0.2);
}
html[data-theme='dark'] .thanks-badge:hover,
html[data-theme='solarized-dark'] .thanks-badge:hover {
  background: #4f9cf9;
  color: #0d1117 !important;
  box-shadow: 0 6px 12px rgba(79, 156, 249, 0.25);
}
</style>

<div class="thanks-grid">
  <a href="https://en.wikipedia.org/wiki/David_J._Malan" target="_blank" rel="noopener noreferrer" class="thanks-badge">Prof. David J. Malan</a>
  <a href="https://en.wikipedia.org/wiki/Andrew_Ng" target="_blank" rel="noopener noreferrer" class="thanks-badge">Prof. Andrew Ng</a>
  <a href="https://en.wikipedia.org/wiki/George_Hotz" target="_blank" rel="noopener noreferrer" class="thanks-badge">George Hotz</a>
  <a href="https://en.wikipedia.org/wiki/Gilbert_Strang" target="_blank" rel="noopener noreferrer" class="thanks-badge">Prof. Gilbert Strang</a>
  <a href="https://en.wikipedia.org/wiki/Geoffrey_Hinton" target="_blank" rel="noopener noreferrer" class="thanks-badge">Prof. Geoffrey Hinton</a>
  <a href="https://physics.mit.edu/faculty/allan-adams/" target="_blank" rel="noopener noreferrer" class="thanks-badge">Prof. Allan Adams</a>
  <a href="https://en.wikipedia.org/wiki/3Blue1Brown" target="_blank" rel="noopener noreferrer" class="thanks-badge">Grant Sanderson</a>
  <a href="https://en.wikipedia.org/wiki/Andrej_Karpathy" target="_blank" rel="noopener noreferrer" class="thanks-badge">Andrej Karpathy</a>
  <a href="https://en.wikipedia.org/wiki/Gary_Gensler" target="_blank" rel="noopener noreferrer" class="thanks-badge">Prof. Gary Gensler</a>
</div>
