(function () {
  // Build overlay DOM once
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');

  const content = document.createElement('div');
  content.className = 'lightbox-content';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  overlay.appendChild(content);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  function open(node) {
    content.innerHTML = '';

    if (node.tagName === 'IMG') {
      const img = document.createElement('img');
      img.src = node.src;
      img.alt = node.alt || '';
      img.className = 'lightbox-img';
      content.appendChild(img);
    } else {
      // Mermaid SVG — read at click time so Mermaid has had time to render
      const svg = node.querySelector('svg');
      if (!svg) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'lightbox-svg';
      wrapper.appendChild(svg.cloneNode(true));
      content.appendChild(wrapper);
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) close();
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Regular images inside article content
    document.querySelectorAll('.content article img').forEach(function (img) {
      img.classList.add('lightbox-trigger');
      img.addEventListener('click', function () { open(this); });
    });

    // Mermaid diagram containers — SVG may not exist yet at DOMContentLoaded
    // so we attach to the container and read the SVG at click time
    document.querySelectorAll('.mermaid-container').forEach(function (container) {
      container.classList.add('lightbox-trigger');
      container.addEventListener('click', function () { open(this); });
    });
  });
})();
