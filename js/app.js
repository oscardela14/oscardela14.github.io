/**
 * Main Application
 * 게시글 목록 렌더링 및 태그 필터링
 */
(function () {
  // 상태 관리
  let allPosts = [];
  let allTags = new Map(); // tag -> count
  let activeTag = null;

  // DOM 요소
  const postsContainer = document.getElementById('posts-container');
  const tagsContainer = document.getElementById('tags-container');
  const loadingEl = document.getElementById('loading');
  const noResultsEl = document.getElementById('no-results');

  /**
   * posts.json에서 게시글 목록 가져오기
   */
  async function fetchPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error('posts.json을 불러올 수 없습니다.');
      }
      const posts = await response.json();
      return posts;
    } catch (error) {
      console.error('게시글 로딩 오류:', error);
      return [];
    }
  }

  /**
   * 태그 집계
   */
  function aggregateTags(posts) {
    const tags = new Map();
    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tags.set(tag, (tags.get(tag) || 0) + 1);
        });
      }
    });
    return tags;
  }

  /**
   * 날짜 포맷팅
   */
  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * 카테고리별 아이콘 매핑
   */
  function getCategoryIcon(category) {
    const icons = {
      '스포츠': '🏸',
      '개발': '💻',
      '공지': '📢',
      '기술': '⚙️',
      '리뷰': '📝',
      'Announcement': '📢',
      'Development': '💻'
    };
    return icons[category] || '📄';
  }

  /**
   * 게시글 카드 HTML 생성 - YONEX Style
   */
  function createPostCard(post) {
    const tagsHTML = Array.isArray(post.tags)
      ? post.tags.slice(0, 3).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')
      : '';
    
    const categoryAttr = post.category ? `data-category="${escapeHTML(post.category)}"` : '';
    const icon = getCategoryIcon(post.category);

    return `
      <article class="post-card" ${categoryAttr} onclick="window.location.href='post.html?file=${encodeURIComponent(post.file)}'">
        <div class="post-card-visual">${icon}</div>
        <div class="post-card-inner">
          <div class="post-card-header">
            ${post.category ? `<span class="post-card-category">${escapeHTML(post.category)}</span>` : ''}
            <time class="post-card-date" datetime="${post.date}">${formatDate(post.date)}</time>
          </div>
          <div class="post-card-footer">
            <h2 class="post-card-title">
              <a href="post.html?file=${encodeURIComponent(post.file)}">${escapeHTML(post.title)}</a>
            </h2>
            ${post.excerpt ? `<p class="post-card-excerpt">${escapeHTML(post.excerpt)}</p>` : ''}
            ${tagsHTML ? `<div class="post-card-tags">${tagsHTML}</div>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  /**
   * HTML 이스케이프
   */
  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 게시글 목록 렌더링
   */
  function renderPosts(posts) {
    if (!postsContainer) return;

    if (posts.length === 0) {
      postsContainer.innerHTML = '';
      if (noResultsEl) noResultsEl.style.display = 'block';
      return;
    }

    if (noResultsEl) noResultsEl.style.display = 'none';
    postsContainer.innerHTML = posts.map(createPostCard).join('');
  }

  /**
   * 태그 버튼 HTML 생성
   */
  function createTagButton(tag, count, isActive) {
    return `
      <button class="tag ${isActive ? 'active' : ''}" data-tag="${escapeHTML(tag)}">
        ${escapeHTML(tag)}
        <span class="tag-count">${count}</span>
      </button>
    `;
  }

  /**
   * 태그 필터 렌더링 - "전체" 버튼만 표시
   */
  function renderTags() {
    if (!tagsContainer) return;

    // 전체 보기 버튼만 표시
    const allButton = `
      <button class="tag ${!activeTag ? 'active' : ''}" data-tag="">
        전체
        <span class="tag-count">${allPosts.length}</span>
      </button>
    `;

    tagsContainer.innerHTML = allButton;

    // 태그 클릭 이벤트
    tagsContainer.querySelectorAll('.tag').forEach(button => {
      button.addEventListener('click', () => {
        const tag = button.dataset.tag;
        activeTag = tag || null;
        filterAndRender();
        renderTags(); // 활성 상태 업데이트
      });
    });
  }

  /**
   * 필터링 및 렌더링
   */
  function filterAndRender() {
    let filtered = allPosts;

    // 태그 필터
    if (activeTag) {
      filtered = filtered.filter(post => 
        Array.isArray(post.tags) && post.tags.includes(activeTag)
      );
    }

    // 검색어 필터 (search.js와 연동)
    if (window.SearchManager && window.SearchManager.query) {
      const query = window.SearchManager.query.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (post.category && post.category.toLowerCase().includes(query)) ||
        (Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    renderPosts(filtered);
  }

  /**
   * 초기화
   */
  async function init() {
    // 게시글 로딩
    allPosts = await fetchPosts();
    allTags = aggregateTags(allPosts);

    // 로딩 숨기기
    if (loadingEl) loadingEl.style.display = 'none';

    // 렌더링
    renderPosts(allPosts);
    renderTags();

    // 검색 연동을 위한 전역 함수 노출
    window.AppManager = {
      filterAndRender,
      get posts() { return allPosts; },
      get activeTag() { return activeTag; }
    };
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


