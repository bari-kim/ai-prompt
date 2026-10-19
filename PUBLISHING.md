# GitHub Pages 배포

관리자 페이지와 SQLite는 내 컴퓨터에서만 실행합니다. 공개 사이트는 `pages-site/`의 HTML, CSS, JavaScript, 이미지 파일만 사용합니다. R2나 외부 데이터베이스는 필요 없습니다.

## 처음 설정

1. 로컬에서 `npm install` 후 `npm run dev`로 앱을 실행합니다.
2. `http://localhost:3000/admin`에서 콘텐츠를 등록하고 배포할 항목을 **공개**로 설정합니다.
3. 프로젝트 루트에서 `npm run pages:export`를 실행합니다.
4. 생성된 `pages-site/`와 `.github/workflows/pages.yml`을 포함해 코드를 GitHub 저장소의 `main` 브랜치에 올립니다. `.env.local`, SQLite, uploads는 올리지 않습니다.
5. GitHub 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
6. **Actions → Deploy public archive to GitHub Pages → Run workflow**를 실행합니다. 이후 `main`에 `pages-site/` 변경사항을 푸시하면 자동 배포합니다.

기본 브랜치 이름이 `main`이 아니면 `.github/workflows/pages.yml`의 `branches`를 변경하세요. 링크는 상대 경로이므로 `사용자.github.io/저장소이름/`과 별도 도메인 모두에서 작동합니다. Node.js 22.18 이상을 사용하세요.

## 콘텐츠를 추가하거나 수정할 때

1. 로컬 관리자 페이지에서 등록·수정·공개 여부를 설정합니다.
2. `npm run pages:export`를 실행합니다.
3. 생성된 결과를 검토하고 아래 명령으로 커밋·푸시합니다.

```sh
git add pages-site
git commit -m "Update public archive"
git push
```

이 명령은 Git 저장소와 원격 연결을 먼저 설정한 상태에서 사용합니다. 내보내기 자체는 GitHub로 전송하지 않습니다. GitHub Actions도 SQLite를 읽지 않고, 커밋된 `pages-site/`만 배포합니다. 내보내지 않고 푸시하면 콘텐츠는 갱신되지 않습니다.

## 배포되는 기능과 데이터

- 공개 항목의 제목, 프롬프트, 태그, 등록일과 해당 항목의 이미지 전체가 포함됩니다.
- 홈은 최신 등록순이며 원본 이미지 비율과 제목 호버를 유지합니다. 상세 이미지 선택과 클립보드 복사가 작동합니다.
- 관리자 링크, 로그인, 업로드 API, 세션, SQLite 원본, 비공개 항목은 포함하지 않습니다.
- 조회수·복사 횟수를 서버에 기록하지 않습니다.
- R2에만 있는 이미지가 발견되거나 로컬 이미지가 없으면 내보내기가 실패하며 기존 배포 폴더는 유지합니다. 현재 방식은 로컬 이미지 저장을 전제로 합니다.
- 비공개 전환·삭제 후 다시 내보내면 해당 페이지와 이미지는 새 배포에서 제거됩니다. 이전 커밋·기존 다운로드·캐시의 사본까지 제거되는 것은 아닙니다. 공개하면 안 되는 자료는 처음부터 내보내지 마세요.

`pages-site/`는 자동 생성 폴더입니다. 직접 수정한 파일은 다음 내보내기에서 교체됩니다. 실제 SQLite와 uploads 폴더는 별도로 백업해야 하며, GitHub Pages 결과물은 로컬 원본의 백업이 아닙니다.

공식 배포 방식: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
