---
title: '블로그에 오신 것을 환영합니다!'
date: 2025-01-26
tags: ['Welcome', 'Blog', 'GitHub Pages']
category: 'Announcement'
description: '첫 번째 게시글입니다. 블로그의 기능을 소개합니다.'
---

# 안녕하세요! 👋

**rana04041's Blog**에 오신 것을 환영합니다!

이 블로그는 GitHub Pages를 사용하여 만들어진 정적 블로그입니다. 마크다운으로 글을 작성하면 자동으로 HTML로 변환되어 보여집니다.

## 주요 기능

이 블로그는 다음과 같은 기능을 제공합니다:

- 🌙 **다크/라이트 모드**: 우측 상단의 버튼으로 테마를 전환할 수 있습니다.
- 🔍 **검색 기능**: 게시글 제목, 내용, 태그로 검색할 수 있습니다.
- 🏷️ **태그 필터링**: 태그를 클릭하면 해당 태그의 게시글만 볼 수 있습니다.
- 💬 **댓글 시스템**: Giscus를 통해 GitHub 계정으로 댓글을 남길 수 있습니다.
- 📱 **반응형 디자인**: 모바일에서도 편하게 읽을 수 있습니다.

## 코드 하이라이팅

코드 블록은 Prism.js로 하이라이팅됩니다:

### JavaScript 예제

```javascript
// 게시글 목록 가져오기
async function fetchPosts() {
  const response = await fetch('posts.json');
  const posts = await response.json();
  return posts;
}

// 사용 예시
fetchPosts().then(posts => {
  console.log(`총 ${posts.length}개의 게시글이 있습니다.`);
});
```

### Python 예제

```python
# 피보나치 수열
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 처음 10개 출력
for i in range(10):
    print(fibonacci(i), end=' ')
```

### Bash 예제

```bash
# 새 게시글 작성 후 배포
git add pages/new-post.md
git commit -m "feat: 새 게시글 추가"
git push origin main
```

## 인용문

> "코드는 한 번 작성되지만 여러 번 읽힙니다. 
> 따라서 가독성이 중요합니다."
> 
> — 로버트 C. 마틴

## 목록 예시

### 순서 없는 목록

- 첫 번째 항목
- 두 번째 항목
  - 중첩된 항목
  - 또 다른 중첩 항목
- 세 번째 항목

### 순서 있는 목록

1. GitHub에서 저장소 생성
2. 로컬에 클론
3. 게시글 작성
4. Push하면 자동 배포!

## 표 (Table)

| 기능 | 설명 | 상태 |
|------|------|------|
| 마크다운 파싱 | marked.js 사용 | ✅ |
| 코드 하이라이팅 | Prism.js 사용 | ✅ |
| 다크 모드 | CSS 변수 기반 | ✅ |
| 댓글 | Giscus 연동 | ✅ |

## 새 게시글 작성하기

새 게시글을 작성하려면:

1. `pages/` 폴더에 `.md` 파일을 생성합니다.
2. 파일 상단에 Front Matter를 추가합니다:

```markdown
---
title: '게시글 제목'
date: 2025-01-26
tags: ['태그1', '태그2']
category: '카테고리'
description: '게시글 설명'
---

본문 내용...
```

3. `git push`하면 자동으로 배포됩니다!

---

즐거운 블로깅 되세요! 🚀


