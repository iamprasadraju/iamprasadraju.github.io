// Dark Mode Toggle - Apple Style
(function() {
  // Check for saved theme preference or default to 'light'
  const getTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Initialize theme on page load
  const initTheme = () => {
    const theme = getTheme();
    applyTheme(theme);
    
    // Sync checkbox state
    const toggleInput = document.getElementById('theme-toggle-input');
    if (toggleInput) {
      toggleInput.checked = theme === 'dark';
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const toggleInput = document.getElementById('theme-toggle-input');
    const isDark = toggleInput.checked;
    const newTheme = isDark ? 'dark' : 'light';
    applyTheme(newTheme);
  };

  // Setup toggle checkbox
  const setupToggle = () => {
    const toggleInput = document.getElementById('theme-toggle-input');
    if (toggleInput) {
      toggleInput.addEventListener('change', toggleTheme);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      setupToggle();
    });
  } else {
    initTheme();
    setupToggle();
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme);
        const toggleInput = document.getElementById('theme-toggle-input');
        if (toggleInput) {
          toggleInput.checked = e.matches;
        }
      }
    });
  }
})();
