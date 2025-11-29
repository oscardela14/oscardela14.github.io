/**
 * Theme Manager
 * 다크/라이트 모드 토글 및 localStorage 저장
 */
(function () {
  const THEME_KEY = 'blog-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  /**
   * 현재 테마 가져오기
   * 우선순위: localStorage > 기본값(dark)
   */
  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  /**
   * 테마 저장
   */
  function setStoredTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  /**
   * 테마 적용
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Giscus 테마도 업데이트 (있는 경우)
    updateGiscusTheme(theme);
  }

  /**
   * Giscus 댓글 테마 업데이트
   */
  function updateGiscusTheme(theme) {
    const giscusFrame = document.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
      const giscusTheme = theme === DARK ? 'dark' : 'light';
      giscusFrame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
      );
    }
  }

  /**
   * 테마 토글
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || DARK;
    const newTheme = currentTheme === DARK ? LIGHT : DARK;
    
    applyTheme(newTheme);
    setStoredTheme(newTheme);
  }

  /**
   * 초기화
   */
  function init() {
    // 저장된 테마 또는 기본값(light) 적용
    const savedTheme = getStoredTheme() || LIGHT;
    applyTheme(savedTheme);

    // 테마 토글 버튼 이벤트 리스너
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);
    }
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 전역 함수로 노출 (다른 스크립트에서 사용 가능)
  window.ThemeManager = {
    toggle: toggleTheme,
    get current() {
      return document.documentElement.getAttribute('data-theme') || LIGHT;
    }
  };
})();


