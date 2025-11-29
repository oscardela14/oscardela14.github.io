/**
 * Post Loader
 * 마크다운 로딩, 파싱 및 Giscus 초기화
 */
(function () {
  // DOM 요소
  const titleEl = document.getElementById('post-title');
  const dateEl = document.getElementById('post-date');
  const categoryEl = document.getElementById('post-category');
  const tagsEl = document.getElementById('post-tags');
  const contentEl = document.getElementById('post-content');
  const giscusContainer = document.getElementById('giscus-container');

  /**
   * URL에서 파일명 파라미터 가져오기
   */
  function getFileParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
  }

  /**
   * Front Matter 파싱
   */
  function parseFrontMatter(content) {
    // UTF-8 BOM 제거
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    
    if (!match) {
      return { metadata: {}, content };
    }

    const frontMatter = match[1];
    const postContent = match[2];
    const metadata = {};

    // 라인별 파싱
    frontMatter.split(/\r?\n/).forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 따옴표 제거
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(',')
              .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });

    return { metadata, content: postContent };
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
   * HTML 이스케이프
   */
  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 마크다운을 HTML로 변환
   */
  function renderMarkdown(markdown) {
    if (typeof marked === 'undefined') {
      console.error('marked.js가 로드되지 않았습니다.');
      return markdown;
    }

    // marked 설정
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    });

    return marked.parse(markdown);
  }

  /**
   * 코드 하이라이팅 적용
   */
  function highlightCode() {
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }

  /**
   * 메타데이터 렌더링
   */
  function renderMetadata(metadata, filename) {
    // 제목
    const title = metadata.title || filename.replace('.md', '');
    if (titleEl) titleEl.textContent = title;
    document.title = `${title} | 지용이의 블로그`;

    // 날짜
    if (dateEl && metadata.date) {
      dateEl.textContent = formatDate(metadata.date);
      dateEl.setAttribute('datetime', metadata.date);
    }

    // 카테고리
    if (categoryEl) {
      if (metadata.category) {
        categoryEl.textContent = metadata.category;
        categoryEl.style.display = 'inline-block';
      } else {
        categoryEl.style.display = 'none';
      }
    }

    // 태그
    if (tagsEl && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
      tagsEl.innerHTML = metadata.tags
        .map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
        .join('');
    }
  }

  /**
   * Giscus 댓글 로드
   */
  function loadGiscus() {
    if (!giscusContainer) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'oscardela14/oscardela14.github.io');
    script.setAttribute('data-repo-id', 'R_kgDOQeng7Q');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOQeng7c4CzJir');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', window.ThemeManager?.current === 'light' ? 'light' : 'dark');
    script.setAttribute('data-lang', 'ko');
    script.crossOrigin = 'anonymous';
    script.async = true;

    giscusContainer.appendChild(script);
  }

  /**
   * 에러 표시
   */
  function showError(message) {
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 2rem; color: var(--error);">
          <p>${escapeHTML(message)}</p>
          <a href="index.html" style="margin-top: 1rem; display: inline-block;">← 목록으로 돌아가기</a>
        </div>
      `;
    }
    if (titleEl) titleEl.textContent = '오류';
    document.title = '오류 | 지용이의 블로그';
  }

  /**
   * 게시글 로드
   */
  async function loadPost() {
    const filename = getFileParam();

    if (!filename) {
      showError('게시글 파일이 지정되지 않았습니다.');
      return;
    }

    try {
      const response = await fetch(`pages/${filename}`);
      
      if (!response.ok) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const rawContent = await response.text();
      const { metadata, content } = parseFrontMatter(rawContent);

      // 메타데이터 렌더링
      renderMetadata(metadata, filename);

      // 마크다운 변환 및 렌더링
      if (contentEl) {
        contentEl.innerHTML = renderMarkdown(content);
        highlightCode();
      }

      // Giscus 로드
      loadGiscus();

    } catch (error) {
      console.error('게시글 로딩 오류:', error);
      showError(error.message || '게시글을 불러오는 중 오류가 발생했습니다.');
    }
  }

  /**
   * 초기화
   */
  function init() {
    loadPost();
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


