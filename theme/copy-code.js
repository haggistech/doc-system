// Copy code button functionality
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Find all code block containers (new structure with language labels)
    const codeContainers = document.querySelectorAll('.code-block-container');

    codeContainers.forEach(function(container) {
      const codeBlock = container.querySelector('pre code');
      if (codeBlock && !container.querySelector('.copy-code-button')) {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 2.5h-3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="6.5" y="1.5" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span class="copy-text">Copy</span>
          <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        container.appendChild(copyButton);

        // Add click event
        copyButton.addEventListener('click', function() {
          copyCode(codeBlock, copyButton);
        });
      }
    });

    // Handle legacy code blocks without containers
    const legacyCodeBlocks = document.querySelectorAll('pre code');
    legacyCodeBlocks.forEach(function(codeBlock) {
      const pre = codeBlock.parentElement;
      // Skip if already in a container
      if (pre.closest('.code-block-container')) {
        return;
      }

      // Create wrapper div if pre doesn't have one
      if (!pre.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 2.5h-3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="6.5" y="1.5" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span class="copy-text">Copy</span>
          <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        wrapper.appendChild(copyButton);

        // Add click event
        copyButton.addEventListener('click', function() {
          copyCode(codeBlock, copyButton);
        });
      }
    });
  });

  function copyCode(codeBlock, button) {
    // Get the code text (strip HTML)
    const code = codeBlock.textContent || codeBlock.innerText;

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function() {
        showCopiedState(button);
      }).catch(function(err) {
        console.error('Failed to copy:', err);
        fallbackCopy(code, button);
      });
    } else {
      fallbackCopy(code, button);
    }
  }

  function fallbackCopy(text, button) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showCopiedState(button);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
  }

  function showCopiedState(button) {
    // Add copied class
    button.classList.add('copied');

    // Remove after 2 seconds
    setTimeout(function() {
      button.classList.remove('copied');
    }, 2000);
  }
})();
