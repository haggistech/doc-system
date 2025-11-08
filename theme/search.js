// Enhanced client-side search functionality
(function() {
  let searchIndex = [];
  let searchInput;
  let searchResults;
  let selectedIndex = -1;

  // Load search index
  fetch('/search-index.json')
    .then(response => response.json())
    .then(data => {
      searchIndex = data;
    })
    .catch(err => console.error('Failed to load search index:', err));

  // Initialize search UI when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Handle search input
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim();
      handleSearch(query);
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
      const results = searchResults.querySelectorAll('.search-result-item');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        updateSelection(results);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(results);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        results[selectedIndex].click();
      } else if (e.key === 'Escape') {
        clearSearch();
      }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        hideResults();
      }
    });

    // Focus search with Ctrl/Cmd + K
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  });

  function handleSearch(query) {
    if (!query || query.length < 2) {
      hideResults();
      return;
    }

    const results = searchDocs(query);
    displayResults(results, query);
  }

  function searchDocs(query) {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const doc of searchIndex) {
      let score = 0;
      let titleMatch = false;
      let descMatch = false;

      // Title matching (higher priority)
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        titleMatch = true;
        score += 10;
        // Boost exact matches
        if (doc.title.toLowerCase() === lowerQuery) {
          score += 20;
        }
        // Boost matches at start
        if (doc.title.toLowerCase().startsWith(lowerQuery)) {
          score += 10;
        }
      }

      // Description matching
      if (doc.description && doc.description.toLowerCase().includes(lowerQuery)) {
        descMatch = true;
        score += 5;
      }

      // Slug matching (lower priority)
      if (doc.slug.toLowerCase().includes(lowerQuery)) {
        score += 2;
      }

      if (score > 0) {
        results.push({
          ...doc,
          score,
          titleMatch,
          descMatch
        });
      }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    // Limit to top 8 results
    return results.slice(0, 8);
  }

  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
      searchResults.classList.add('visible');
      return;
    }

    const html = results.map((result, index) => {
      const title = highlightText(result.title, query);
      const description = result.description
        ? highlightText(truncateText(result.description, 100), query)
        : '';

      return `
        <a href="/docs/${result.slug}.html" class="search-result-item" data-index="${index}">
          <div class="search-result-title">${title}</div>
          ${description ? `<div class="search-result-description">${description}</div>` : ''}
          <div class="search-result-path">${result.slug}</div>
        </a>
      `;
    }).join('');

    searchResults.innerHTML = html;
    searchResults.classList.add('visible');
    selectedIndex = -1;
  }

  function highlightText(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function updateSelection(results) {
    results.forEach((result, index) => {
      if (index === selectedIndex) {
        result.classList.add('selected');
        result.scrollIntoView({ block: 'nearest' });
      } else {
        result.classList.remove('selected');
      }
    });
  }

  function hideResults() {
    searchResults.classList.remove('visible');
    selectedIndex = -1;
  }

  function clearSearch() {
    searchInput.value = '';
    hideResults();
    searchInput.blur();
  }

  // Export for backward compatibility
  window.searchDocs = searchDocs;
})();
