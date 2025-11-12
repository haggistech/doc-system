// Enhanced client-side search with full-text, previews, and recent searches
(function() {
  let searchIndex = [];
  let searchInput;
  let searchResults;
  let selectedIndex = -1;
  const MAX_RECENT_SEARCHES = 5;
  const RECENT_SEARCHES_KEY = 'doc-system-recent-searches';

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

    // Show recent searches when focused
    searchInput.addEventListener('focus', function() {
      if (!searchInput.value.trim()) {
        showRecentSearches();
      }
    });

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
        const selectedResult = results[selectedIndex];
        if (selectedResult.dataset.query) {
          // It's a recent search, perform the search
          searchInput.value = selectedResult.dataset.query;
          handleSearch(selectedResult.dataset.query);
        } else {
          // It's a result, navigate to it
          selectedResult.click();
        }
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
        searchInput.select();
      }
    });

    // Handle clicks on search results and recent searches
    searchResults.addEventListener('click', function(e) {
      // Handle clear button click first
      if (e.target.classList.contains('search-clear-recent')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const resultItem = e.target.closest('.search-result-item');

      if (resultItem) {
        // Check if it's a recent search item
        if (resultItem.dataset.query) {
          e.preventDefault();
          e.stopPropagation();
          const query = resultItem.dataset.query;
          searchInput.value = query;
          searchInput.focus();
          handleSearch(query);
        } else if (searchInput.value.trim()) {
          // Regular result click - save the search
          saveRecentSearch(searchInput.value.trim());
        }
      }
    });
  });

  function handleSearch(query) {
    if (!query || query.length < 2) {
      if (!query) {
        showRecentSearches();
      } else {
        hideResults();
      }
      return;
    }

    const results = searchDocs(query);
    displayResults(results, query);
  }

  function searchDocs(query) {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const queryTerms = lowerQuery.split(/\s+/).filter(t => t.length > 1);
    const results = [];

    for (const doc of searchIndex) {
      let score = 0;
      let titleMatch = false;
      let descMatch = false;
      let contentMatch = false;
      let contentSnippet = '';

      // Title matching (highest priority)
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        titleMatch = true;
        score += 100;
        // Boost exact matches
        if (doc.title.toLowerCase() === lowerQuery) {
          score += 50;
        }
        // Boost matches at start
        if (doc.title.toLowerCase().startsWith(lowerQuery)) {
          score += 30;
        }
      }

      // Description matching
      if (doc.description && doc.description.toLowerCase().includes(lowerQuery)) {
        descMatch = true;
        score += 50;
      }

      // Full-text content matching
      if (doc.content) {
        const contentLower = doc.content.toLowerCase();

        // Check for exact phrase match
        if (contentLower.includes(lowerQuery)) {
          contentMatch = true;
          score += 30;
          contentSnippet = extractSnippet(doc.content, lowerQuery);
        } else {
          // Check for individual term matches
          let termMatches = 0;
          for (const term of queryTerms) {
            if (contentLower.includes(term)) {
              termMatches++;
            }
          }

          if (termMatches > 0) {
            contentMatch = true;
            score += termMatches * 10;
            contentSnippet = extractSnippet(doc.content, queryTerms[0]);
          }
        }
      }

      // Slug matching (lower priority)
      if (doc.slug.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      if (score > 0) {
        results.push({
          ...doc,
          score,
          titleMatch,
          descMatch,
          contentMatch,
          contentSnippet
        });
      }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    // Limit to top 8 results
    return results.slice(0, 8);
  }

  function extractSnippet(content, query, maxLength = 150) {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) return '';

    // Calculate snippet start and end
    const snippetStart = Math.max(0, index - 50);
    const snippetEnd = Math.min(content.length, index + query.length + maxLength);

    let snippet = content.substring(snippetStart, snippetEnd);

    // Add ellipsis if needed
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < content.length) snippet = snippet + '...';

    return snippet.trim();
  }

  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
      searchResults.classList.add('visible');
      return;
    }

    const html = results.map((result, index) => {
      const title = highlightText(result.title, query);

      // Prefer content snippet over description
      let preview = '';
      if (result.contentMatch && result.contentSnippet) {
        preview = highlightText(result.contentSnippet, query);
      } else if (result.description) {
        preview = highlightText(truncateText(result.description, 100), query);
      }

      return `
        <a href="/docs/${result.slug}.html" class="search-result-item" data-index="${index}">
          <div class="search-result-title">${title}</div>
          ${preview ? `<div class="search-result-preview">${preview}</div>` : ''}
          <div class="search-result-path">${result.slug}</div>
        </a>
      `;
    }).join('');

    searchResults.innerHTML = html;
    searchResults.classList.add('visible');
    selectedIndex = -1;
  }

  function showRecentSearches() {
    const recentSearches = getRecentSearches();

    if (recentSearches.length === 0) {
      hideResults();
      return;
    }

    const html = `
      <div class="search-recent-header">
        <span>Recent Searches</span>
        <button class="search-clear-recent" onclick="window.clearRecentSearches(); return false;">Clear</button>
      </div>
      ${recentSearches.map((query, index) => `
        <div class="search-result-item recent-search-item" data-query="${escapeHtml(query)}" data-index="${index}">
          <span class="recent-search-icon">🕐</span>
          <span class="recent-search-text">${escapeHtml(query)}</span>
        </div>
      `).join('')}
    `;

    searchResults.innerHTML = html;
    searchResults.classList.add('visible');
    selectedIndex = -1;
  }

  function getRecentSearches() {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecentSearch(query) {
    try {
      let recent = getRecentSearches();

      // Remove if already exists
      recent = recent.filter(q => q !== query);

      // Add to beginning
      recent.unshift(query);

      // Keep only last MAX_RECENT_SEARCHES
      recent = recent.slice(0, MAX_RECENT_SEARCHES);

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch (e) {
      // localStorage might be disabled
    }
  }

  function clearRecentSearches() {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      hideResults();
    } catch (e) {
      // localStorage might be disabled
    }
  }

  function highlightText(text, query) {
    if (!query) return text;

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    let result = text;

    // Highlight each term
    for (const term of terms) {
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    }

    return result;
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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

  // Export functions for global access
  window.searchDocs = searchDocs;
  window.clearRecentSearches = function() {
    clearRecentSearches();
    if (document.activeElement === searchInput) {
      showRecentSearches();
    }
  };
})();
