# AI Prompt Archive

AI 이미지와 생성에 사용한 프롬프트를 기록하고 공유하는 개인 아카이브입니다. Next.js, React, TypeScript, Drizzle ORM, SQLite로 구성되어 있습니다.

내 컴퓨터의 관리자 페이지에서 콘텐츠를 관리하고, 공개 항목만 정적 파일로 내보내 GitHub Pages에 배포합니다. 외부 데이터베이스나 Cloudflare R2 없이 사용할 수 있습니다.

## 주요 기능

- 이미지와 Positive / Negative 프롬프트 등록·수정·삭제
- 태그와 공개·비공개 상태 관리
- 원본 비율을 유지하는 홈 갤러리와 제목 호버
- 상세 페이지의 이미지 선택과 프롬프트 복사
- 이미지 최상단을 기준으로 표시하는 관리자 목록의 정사각형 썸네일
- 공개 콘텐츠만 GitHub Pages용 파일로 내보내기

## 로컬 실행

Node.js 22.18 이상과 npm이 필요합니다. 모든 명령은 프로젝트 루트에서 실행합니다.

1. 의존성을 설치합니다.

   ```sh
   npm install
   ```

2. `frontend/.env.example`을 복사해 `frontend/.env.local`을 만듭니다. 기존 설정 파일이 있으면 그대로 사용합니다.
3. 관리자 비밀번호 해시를 생성합니다.

   ```sh
   npm run generate-admin-password
   ```

   비밀번호를 두 번 입력하고, 출력된 `ADMIN_PASSWORD_HASH=...` 줄을 `.env.local`에 그대로 넣습니다. `$` 앞의 역슬래시도 유지해야 Next.js가 해시를 올바르게 읽습니다. 비밀번호는 8자 이상이어야 합니다.

4. 개발 서버를 실행합니다.

   ```sh
   npm run dev
   ```

5. 홈은 <http://localhost:3000>, 관리자 페이지는 <http://localhost:3000/admin>에서 엽니다.

관리자는 한 명이며 회원가입이나 관리자 이메일 설정은 없습니다. 환경변수를 변경하면 서버를 다시 실행합니다. PowerShell에서 `npm.ps1` 실행 정책 오류가 발생하면 `npm` 대신 `npm.cmd`를 사용합니다.

## 데이터 저장 위치

| 경로 | 저장 내용 |
| --- | --- |
| `frontend/data/prompt-archive.sqlite` | 프롬프트, 태그, 이미지 경로, 집계 정보, 관리자 세션 |
| `frontend/data/uploads/` | 로컬에서 업로드한 이미지 원본 |
| `frontend/data/backups/` | DB 백업 명령으로 생성한 SQLite 사본 |
| `pages-site/` | GitHub Pages에 배포할 공개 페이지와 이미지 |

SQLite 파일은 앱이 DB를 처음 사용할 때 자동 생성됩니다. `SQLITE_DB_PATH`를 변경하면 이미지와 백업도 해당 DB 파일 옆의 `uploads/`, `backups/`에 저장됩니다.

## GitHub Pages 배포

1. 로컬 관리자 페이지에서 배포할 항목을 **공개**로 설정합니다.
2. 공개 사이트를 생성합니다.

   ```sh
   npm run pages:export
   ```

3. 생성된 `pages-site/`와 `.github/workflows/pages.yml`을 GitHub 저장소에 포함합니다.
4. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
5. `main` 브랜치에 배포 파일을 푸시하거나 **Actions → Deploy public archive to GitHub Pages → Run workflow**를 실행합니다.

이후에도 로컬에서 콘텐츠를 수정한 뒤 내보내기와 커밋·푸시를 반복합니다. GitHub Actions는 커밋된 `pages-site/`만 배포하며, 내 컴퓨터의 SQLite를 직접 읽지 않습니다. 기본 브랜치가 `main`이 아니면 워크플로의 브랜치 설정을 변경합니다.

공개 사이트에는 관리자 기능이나 조회수·복사 횟수의 서버 집계가 포함되지 않습니다. SQLite 원본, 세션, 비공개 항목은 내보내지 않습니다. 공개 항목에 연결된 이미지는 모두 포함되므로 배포 전에 내용을 확인합니다.

`pages-site/`는 자동 생성 폴더이며, 직접 수정한 내용은 다음 내보내기에서 교체됩니다. 비공개 전환이나 삭제도 다시 내보내고 배포해야 반영됩니다. 이전 Git 커밋이나 다운로드된 사본까지 지워지는 것은 아닙니다.

자세한 절차와 제한 사항은 [GitHub Pages 배포 안내](PUBLISHING.md)를 참고하세요.

## 환경변수

설정 예시는 [frontend/.env.example](frontend/.env.example)에 있습니다.

| 변수 | 용도 |
| --- | --- |
| `SQLITE_DB_PATH` | SQLite 파일 경로. 상대 경로는 `frontend/` 기준이며 기본값은 `./data/prompt-archive.sqlite` |
| `ADMIN_PASSWORD_HASH` | 비밀번호 생성 명령이 출력한 Argon2id 해시 |
| `SESSION_SECRET` | 세션 관련 설정용 값. 현재 세션 인증은 DB에 저장한 토큰 해시로 처리 |
| `NEXT_PUBLIC_SITE_URL` | 로컬 앱의 사이트맵 등에 사용하는 사이트 주소. 기본값은 `http://localhost:3000` |
| `R2_ACCOUNT_ID` | 선택 사항: Cloudflare 계정 ID |
| `R2_ACCESS_KEY_ID` | 선택 사항: R2 접근 키 ID |
| `R2_SECRET_ACCESS_KEY` | 선택 사항: R2 비밀 접근 키 |
| `R2_BUCKET_NAME` | 선택 사항: R2 버킷 이름 |

현재의 로컬 관리·GitHub Pages 배포 방식에서는 R2 변수 네 개를 모두 비워 둡니다. 네 값을 모두 설정하면 새 이미지는 R2에 저장됩니다. 일부만 설정하면 업로드 오류가 발생합니다. R2에 저장한 이미지는 현재 정적 내보내기에서 지원하지 않으므로 먼저 로컬 저장소로 이전해야 합니다.

`.env.local`, SQLite 파일, 백업, 로컬 이미지 원본은 GitHub에 올리지 않습니다. 이 경로들은 `.gitignore`에 포함되어 있습니다.

## 백업

DB 사본은 다음 명령으로 생성합니다.

```sh
npm run db:backup
```

현재 백업 명령은 DB 파일을 복사하므로 앱을 종료한 상태에서 실행합니다. 이미지 원본은 자동 백업되지 않습니다. `uploads/` 폴더도 함께 백업하고, DB와 이미지를 다른 드라이브 등에 보관하세요. `pages-site/`에는 비공개 자료가 없으므로 원본 전체의 백업을 대신할 수 없습니다.

## 개발 확인 명령

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build`는 로컬 서버용 Next.js 빌드입니다. GitHub Pages용 파일은 `npm run pages:export`로 생성합니다.
