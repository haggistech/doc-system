// Table of Contents scroll spy and smooth scrolling
(function() {
  let tocLinks = [];
  let headings = [];
  let currentActiveLink = null;

  document.addEventListener('DOMContentLoaded', function() {
    const toc = document.querySelector('.toc');
    if (!toc) return; // No TOC on this page

    // Get all TOC links and corresponding headings
    tocLinks = Array.from(toc.querySelectorAll('.toc-item a'));
    headings = tocLinks.map(link => {
      const id = link.getAttribute('href').substring(1);
      return document.getElementById(id);
    }).filter(Boolean);

    if (headings.length === 0) return;

    // Smooth scrolling for TOC links
    tocLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const navbarHeight = 60; // Adjust based on your navbar height
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL without triggering scroll
          history.pushState(null, '', '#' + targetId);
        }
      });
    });

    // Scroll spy - highlight current section
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial check
    updateActiveLink();

    // Handle hash on page load
    if (window.location.hash) {
      setTimeout(() => {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const navbarHeight = 60;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  });

  function updateActiveLink() {
    const scrollPosition = window.pageYOffset + 100; // Offset for navbar

    // Find the current heading
    let current = headings[0];
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading && heading.offsetTop <= scrollPosition) {
        current = heading;
        break;
      }
    }

    // Update active link
    if (current) {
      const activeLink = tocLinks.find(link => {
        const id = link.getAttribute('href').substring(1);
        return id === current.id;
      });

      if (activeLink && activeLink !== currentActiveLink) {
        // Remove previous active
        if (currentActiveLink) {
          currentActiveLink.classList.remove('active');
        }

        // Add new active
        activeLink.classList.add('active');
        currentActiveLink = activeLink;

        // Scroll TOC to keep active item visible
        const tocSidebar = document.querySelector('.toc-sidebar');
        if (tocSidebar) {
          const linkRect = activeLink.getBoundingClientRect();
          const sidebarRect = tocSidebar.getBoundingClientRect();

          if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
            activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }
    }
  }
})();
