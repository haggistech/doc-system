// Line numbers toggle functionality for code blocks

document.addEventListener('DOMContentLoaded', function() {
  // Get user's preference from localStorage (default: show line numbers)
  const showLineNumbers = localStorage.getItem('showLineNumbers') !== 'false';

  // Apply initial state to all code blocks
  document.querySelectorAll('.code-block-container pre').forEach(pre => {
    if (showLineNumbers) {
      pre.classList.add('show-line-numbers');
      pre.classList.remove('hide-line-numbers');
    } else {
      pre.classList.add('hide-line-numbers');
      pre.classList.remove('show-line-numbers');
    }
  });

  // Add click handlers to all toggle buttons
  document.querySelectorAll('.toggle-line-numbers').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Find the pre element in this code block
      const container = this.closest('.code-block-container');
      const pre = container.querySelector('pre');

      // Toggle the state
      if (pre.classList.contains('show-line-numbers')) {
        pre.classList.remove('show-line-numbers');
        pre.classList.add('hide-line-numbers');
        localStorage.setItem('showLineNumbers', 'false');
      } else {
        pre.classList.remove('hide-line-numbers');
        pre.classList.add('show-line-numbers');
        localStorage.setItem('showLineNumbers', 'true');
      }

      // Sync all other code blocks on the page
      const newState = pre.classList.contains('show-line-numbers');
      document.querySelectorAll('.code-block-container pre').forEach(otherPre => {
        if (otherPre !== pre) {
          if (newState) {
            otherPre.classList.remove('hide-line-numbers');
            otherPre.classList.add('show-line-numbers');
          } else {
            otherPre.classList.remove('show-line-numbers');
            otherPre.classList.add('hide-line-numbers');
          }
        }
      });
    });
  });
});
