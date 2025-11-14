// Dark mode theme switcher with localStorage persistence
(function() {
  const THEME_KEY = 'doc-system-theme';
  const LIGHT = 'light';
  const DARK = 'dark';

  // Get saved theme or detect system preference
  function getInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK;
    }

    return LIGHT;
  }

  // Apply theme to document
  function applyTheme(theme) {
    if (theme === DARK) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // Update toggle button icons
  function updateToggleButton(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    const sunIcon = toggle.querySelector('.sun-icon');
    const moonIcon = toggle.querySelector('.moon-icon');

    if (theme === DARK) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }

  // Toggle between light and dark
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? DARK : LIGHT;
    const newTheme = currentTheme === DARK ? LIGHT : DARK;

    applyTheme(newTheme);
    updateToggleButton(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }

  // Initialize on page load
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  // Wait for DOM to be ready before updating button
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateToggleButton(initialTheme);

      // Attach click handler
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', toggleTheme);
      }
    });
  } else {
    updateToggleButton(initialTheme);

    // Attach click handler
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        const newTheme = e.matches ? DARK : LIGHT;
        applyTheme(newTheme);
        updateToggleButton(newTheme);
      }
    });
  }
})();
