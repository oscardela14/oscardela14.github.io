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

    // 더 유연한 정규식: 줄바꿈 형식에 관계없이 동작
    const match = content.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]+([\s\S]*)$/);
    
    if (!match) {
      console.log('Front matter를 찾을 수 없습니다. 전체 내용을 표시합니다.');
      return { metadata: {}, content };
    }

    const frontMatter = match[1];
    const postContent = match[2];
    const metadata = {};
    
    console.log('Front matter 파싱 완료:', frontMatter.substring(0, 50) + '...');
    console.log('본문 길이:', postContent.length, '자');

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
      return `<pre style="white-space: pre-wrap;">${markdown}</pre>`;
    }

    try {
      if (marked.setOptions) {
        marked.setOptions({
          breaks: true,
          gfm: true
        });
      }

      if (typeof marked.parse === 'function') {
        return marked.parse(markdown);
      } else if (typeof marked === 'function') {
        return marked(markdown);
      }
      
      return markdown;
    } catch (error) {
      console.error('마크다운 파싱 오류:', error);
      return `<pre style="white-space: pre-wrap;">${markdown}</pre>`;
    }
  }

  /**
   * 콘텐츠를 아코디언 섹션으로 변환
   */
  function convertToAccordion(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const children = Array.from(tempDiv.children);
    let sections = [];
    let currentSection = null;
    let introContent = [];
    let foundFirstH2 = false;

    children.forEach(child => {
      if (child.tagName === 'H2') {
        foundFirstH2 = true;
        if (currentSection) {
          sections.push(currentSection);
        }
        // 섹션 제목에서 키워드 추출
        const titleText = child.textContent || '';
        const linkEl = child.querySelector('a');
        const linkUrl = linkEl ? linkEl.href : null;
        let sectionId = '';
        
        // 배드민턴 브랜드
        if (titleText.includes('요넥스') || titleText.includes('YONEX')) sectionId = 'yonex';
        else if (titleText.includes('빅터') || titleText.includes('VICTOR')) sectionId = 'victor';
        else if (titleText.includes('리닝') || titleText.includes('Li-Ning')) sectionId = 'lining';
        else if (titleText.includes('기타')) sectionId = 'other';
        else if (titleText.includes('비교')) sectionId = 'compare';
        else if (titleText.includes('구매')) sectionId = 'tips';
        // UFC 섹션
        else if (titleText.includes('챔피언') || titleText.includes('Champion')) sectionId = 'champion';
        else if (titleText.includes('UFC 322')) sectionId = 'ufc322';
        else if (titleText.includes('카타르') || titleText.includes('Qatar')) sectionId = 'qatar';
        else if (titleText.includes('2026') || titleText.includes('빅매치')) sectionId = 'bigmatch';
        else if (titleText.includes('주목') || titleText.includes('선수')) sectionId = 'players';
        else if (titleText.includes('요약') || titleText.includes('Summary')) sectionId = 'summary';
        // 2025 핫키워드 섹션
        else if (titleText.includes('옴니보어') || titleText.includes('Omnivore')) sectionId = 'omnivore';
        else if (titleText.includes('아보하') || titleText.includes('Aboha')) sectionId = 'aboha';
        else if (titleText.includes('토핑경제') || titleText.includes('Topping')) sectionId = 'topping';
        else if (titleText.includes('무해력') || titleText.includes('Harmless')) sectionId = 'harmless';
        else if (titleText.includes('실용소비') || titleText.includes('안티플렉스')) sectionId = 'practical';
        else if (titleText.includes('AI 시대') || titleText.includes('제로클릭')) sectionId = 'ai';
        else if (titleText.includes('한눈에') || titleText.includes('트렌드')) sectionId = 'summary';
        // 공통 섹션
        else if (titleText.includes('관련 영상') || titleText.includes('📺')) sectionId = 'video';
        else if (titleText.includes('마무리') || titleText.includes('결론')) sectionId = 'outro';
        else sectionId = 'section-' + sections.length;

        currentSection = {
          id: sectionId,
          title: child.outerHTML,
          titleText: titleText,
          linkUrl: linkUrl,
          content: []
        };
      } else if (currentSection) {
        currentSection.content.push(child.outerHTML);
      } else if (!foundFirstH2) {
        introContent.push(child.outerHTML);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    // 아코디언 HTML 생성
    let accordionHTML = '';
    
    // 인트로 콘텐츠
    if (introContent.length > 0) {
      accordionHTML += `<div class="post-intro">${introContent.join('')}</div>`;
    }

    // 아코디언 섹션
    if (sections.length > 0) {
      accordionHTML += '<div class="accordion-container">';
      sections.forEach((section, index) => {
        const isOpen = ''; // 모든 항목 닫힌 상태로 시작
        const hasLink = section.linkUrl ? true : false;
        
        // 링크 버튼은 콘텐츠 내부에 표시 (브랜드명 포함)
        const linkButton = hasLink ? `
          <div class="accordion-link-wrapper">
            <a href="${section.linkUrl}" target="_blank" class="accordion-link-btn">
              🔗 ${section.titleText} 바로가기
            </a>
          </div>
        ` : '';
        
        accordionHTML += `
          <div class="accordion-item ${isOpen}" data-section="${section.id}">
            <button class="accordion-header" aria-expanded="false">
              <span class="accordion-title">${section.titleText}</span>
              <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
              ${linkButton}
              ${section.content.join('')}
            </div>
          </div>
        `;
      });
      accordionHTML += '</div>';
    }

    return accordionHTML;
  }

  /**
   * 아코디언 이벤트 초기화
   */
  function initAccordion() {
    // 아코디언 헤더 클릭 이벤트
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
      header.addEventListener('click', (e) => {
        const item = header.parentElement;
        const isOpen = item.classList.contains('open');
        
        // 현재 항목 토글
        item.classList.toggle('open');
        header.setAttribute('aria-expanded', !isOpen);
      });
    });

    // 태그 클릭으로 아코디언 열기
    const tags = document.querySelectorAll('#post-tags .tag');
    tags.forEach(tag => {
      tag.style.cursor = 'pointer';
      tag.addEventListener('click', () => {
        const tagText = tag.textContent.trim();
        let targetId = '';
        
        // 배드민턴 태그
        if (tagText === '요넥스') targetId = 'yonex';
        else if (tagText === '빅터') targetId = 'victor';
        else if (tagText === '리닝') targetId = 'lining';
        else if (tagText === '기타 주목할 브랜드') targetId = 'other';
        else if (tagText === '브랜드별 비교정리') targetId = 'compare';
        else if (tagText === '구매팁') targetId = 'tips';
        else if (tagText === '기타') targetId = 'other';
        // UFC 태그
        else if (tagText === '챔피언 소식') targetId = 'champion';
        else if (tagText === 'UFC 322') targetId = 'ufc322';
        else if (tagText === '카타르') targetId = 'qatar';
        else if (tagText === '2026년 빅매치') targetId = 'bigmatch';
        else if (tagText === '주목할 선수들') targetId = 'players';
        else if (tagText === 'UFC 요약') targetId = 'summary';
        // 2025 핫키워드 태그
        else if (tagText === '옴니보어') targetId = 'omnivore';
        else if (tagText === '아보하') targetId = 'aboha';
        else if (tagText === '토핑경제') targetId = 'topping';
        else if (tagText === '무해력') targetId = 'harmless';
        else if (tagText === '실용소비') targetId = 'practical';
        else if (tagText === 'AI시대') targetId = 'ai';
        // 공통 태그
        else if (tagText === '관련 영상') targetId = 'video';
        else if (tagText === '마무리') targetId = 'outro';
        
        if (targetId) {
          const targetItem = document.querySelector(`.accordion-item[data-section="${targetId}"]`);
          if (targetItem) {
            // 해당 섹션 열기
            if (!targetItem.classList.contains('open')) {
              targetItem.classList.add('open');
              targetItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
            }
            // 스크롤
            targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
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

    // 현재 게시글 파일명 가져오기 (각 게시글마다 별도 댓글창)
    const fileName = getFileParam() || 'default';
    const postTitle = document.getElementById('post-title')?.textContent || fileName;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'oscardela14/oscardela14.github.io');
    script.setAttribute('data-repo-id', 'R_kgDOQeng7Q');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOQeng7c4CzJir');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', fileName); // 파일명으로 각 게시글 구분
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'light');
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
   * 최신 게시글 파일명 가져오기
   */
  async function getLatestPostFile() {
    try {
      const response = await fetch('posts.json');
      if (response.ok) {
        const posts = await response.json();
        if (posts.length > 0) {
          return posts[0].file; // 최신 게시글
        }
      }
    } catch (e) {
      console.error('posts.json 로딩 실패:', e);
    }
    return null;
  }

  /**
   * 게시글 로드
   */
  async function loadPost() {
    let filename = getFileParam();

    // 파일 파라미터가 없으면 최신 게시글 로드
    if (!filename) {
      filename = await getLatestPostFile();
      if (!filename) {
        showError('게시글을 찾을 수 없습니다.');
        return;
      }
      // URL 업데이트 (히스토리에 추가하지 않음)
      window.history.replaceState({}, '', `post.html?file=${filename}`);
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
        const htmlContent = renderMarkdown(content);
        // 아코디언 형태로 변환
        contentEl.innerHTML = convertToAccordion(htmlContent);
        highlightCode();
        // 아코디언 이벤트 초기화
        initAccordion();
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


