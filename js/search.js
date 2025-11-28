/**
 * Search Manager
 * 클라이언트 사이드 검색 기능
 */
(function () {
  // 상태
  let searchQuery = '';
  let debounceTimer = null;

  // DOM 요소
  const searchInput = document.getElementById('search-input');

  /**
   * 디바운스 함수
   */
  function debounce(func, delay) {
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * 검색 실행
   */
  function performSearch(query) {
    searchQuery = query.trim();

    // AppManager와 연동하여 필터링 및 렌더링
    if (window.AppManager && typeof window.AppManager.filterAndRender === 'function') {
      window.AppManager.filterAndRender();
    }
  }

  /**
   * 검색 입력 핸들러
   */
  const handleSearchInput = debounce(function (event) {
    performSearch(event.target.value);
  }, 300);

  /**
   * 초기화
   */
  function init() {
    if (!searchInput) return;

    // 입력 이벤트 리스너
    searchInput.addEventListener('input', handleSearchInput);

    // Enter 키 처리 (즉시 검색)
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        clearTimeout(debounceTimer);
        performSearch(event.target.value);
      }
    });

    // ESC 키로 검색어 초기화
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        searchInput.value = '';
        performSearch('');
        searchInput.blur();
      }
    });

    // 키보드 단축키: Ctrl+K 또는 Cmd+K로 검색창 포커스
    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 전역 함수로 노출
  window.SearchManager = {
    get query() { return searchQuery; },
    search: performSearch,
    clear: function () {
      if (searchInput) searchInput.value = '';
      performSearch('');
    }
  };
})();


