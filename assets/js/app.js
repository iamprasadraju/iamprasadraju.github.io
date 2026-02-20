// Dark Mode Toggle
(function() {
  const getTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateActiveIcon(theme);
  };

  const updateActiveIcon = (theme) => {
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.classList.remove('active');
        moonIcon.classList.add('active');
      } else {
        sunIcon.classList.add('active');
        moonIcon.classList.remove('active');
      }
    }
  };

  const initTheme = () => {
    const theme = getTheme();
    applyTheme(theme);
  };

  const setupToggle = () => {
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    
    if (sunIcon) {
      sunIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        applyTheme('light');
      });
    }
    
    if (moonIcon) {
      moonIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        applyTheme('dark');
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      setupToggle();
    });
  } else {
    initTheme();
    setupToggle();
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme);
      }
    });
  }
})();

// Code Block Copy Button
(function() {
  const copyIcon = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>';
  const checkIcon = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>';

  const addCopyButtons = () => {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      if (pre.classList.contains('copy-enabled')) return;
      pre.classList.add('copy-enabled');
      
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      
      // Block copy button (top)
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.type = 'button';
      copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
      copyBtn.innerHTML = copyIcon + '<span>Copy</span>';
      
      // Split into lines
      const lines = codeBlock.innerHTML.split('\n');
      const linesContainer = document.createElement('div');
      linesContainer.className = 'code-lines';
      
      lines.forEach((line, index) => {
        if (index === lines.length - 1 && line === '') return;
        
        const lineDiv = document.createElement('div');
        lineDiv.className = 'code-line';
        
        const lineContent = document.createElement('span');
        lineContent.className = 'code-line-content';
        lineContent.innerHTML = line || ' ';
        
        // Only add copy button if line has content
        const textContent = lineContent.textContent.trim();
        if (textContent) {
          const lineCopyBtn = document.createElement('button');
          lineCopyBtn.className = 'line-copy-btn';
          lineCopyBtn.type = 'button';
          lineCopyBtn.innerHTML = copyIcon;
          lineCopyBtn.setAttribute('aria-label', 'Copy line');
          
          lineCopyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
              await navigator.clipboard.writeText(textContent);
              lineCopyBtn.classList.add('copied');
              lineCopyBtn.innerHTML = checkIcon;
              setTimeout(() => {
                lineCopyBtn.classList.remove('copied');
                lineCopyBtn.innerHTML = copyIcon;
              }, 1500);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          });
          
          lineDiv.appendChild(lineCopyBtn);
        }
        
        lineDiv.appendChild(lineContent);
        linesContainer.appendChild(lineDiv);
      });
      
      // Replace code content with lines
      codeBlock.innerHTML = '';
      codeBlock.appendChild(linesContainer);
      
      copyBtn.addEventListener('click', async () => {
        const code = codeBlock.textContent;
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = checkIcon + '<span>Copied!</span>';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = copyIcon + '<span>Copy</span>';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
      
      wrapper.appendChild(copyBtn);
      wrapper.appendChild(pre);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
