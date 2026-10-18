# Ersione’s Studio

캐릭터와 함께 집을 탐험하고, 개인 프로젝트와 12가지 미니게임을 만나는 작은 작업실입니다.

[![Deploy studio to GitHub Pages](https://github.com/ersione/ersione-studio/actions/workflows/pages.yml/badge.svg)](https://github.com/ersione/ersione-studio/actions/workflows/pages.yml)
![Node.js 24](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)

**[Studio 둘러보기](https://studio.ersione.com/)** · [설치](#설치) · [사용법](#사용법) · [개발과 검증](#개발과-검증)

## 주요 기능

- 거실·작업방·주방·휴식방을 돌아다니는 3D 집과 캐릭터
- 방 안 사물과 목록에서 여는 개인 프로젝트 소개 및 서비스 링크
- 레트로 게임기에서 고르는 퍼즐·리듬·슈팅·레이싱 등 12가지 미니게임
- 키보드·마우스·터치 조작과 모바일 화면 지원
- WebGL2를 사용할 수 없을 때 자동으로 전환하는 가벼운 모드
- 기기 현지 시간에 맞춘 낮·밤 조명과 브라우저에 저장되는 조명·효과음 설정

React·Three.js·Vite로 만든 정적 웹앱입니다. 별도 서버나 API 키 없이 실행할 수 있습니다.

## 요구사항

- Node.js 24와 npm
- Git: 소스와 Git 의존성 설치에 사용
- 최신 웹 브라우저: 3D 보기에는 WebGL2 지원 필요
- 브라우저 테스트·이미지 생성에는 Playwright Chromium 필요

## 설치

```sh
git clone https://github.com/ersione/ersione-studio.git
cd ersione-studio
npm ci
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 엽니다. 기본 주소는 `http://127.0.0.1:5173/`이며 포트가 사용 중이면 다른 포트로 실행됩니다.

## 사용법

설치 없이 [공개 Studio](https://studio.ersione.com/)에 접속해 사용할 수 있습니다.

### 집 둘러보기

| 조작 | 동작 |
| --- | --- |
| WASD / 방향키 | 현재 시점 기준으로 캐릭터 이동 |
| 화면 방향 버튼 길게 누르기 | 캐릭터 이동, 놓으면 정지 |
| E / 근처 사물 열기 버튼 | 가까운 프로젝트 또는 게임 열기 |
| 사물 클릭 / 아래 프로젝트 목록 | 거리와 관계없이 바로 열기 |
| 방 이동 버튼 | 해당 공간 입구로 이동하고 시점 확대 |
| 집 전체 / ↺ | 전체 집 시점으로 복귀 |
| 드래그 | 3D 시점 회전 |
| 스크롤 / 두 손가락 핀치 | 확대·축소 |

거실의 TV·콘솔에서는 게임을, 작업방의 모니터·몬스터볼·팔레트에서는 프로젝트를 열 수 있습니다. 방을 확대해서 걸으면 시점이 캐릭터를 따라갑니다. 모달을 열거나 창·탭을 떠나면 이동을 멈춥니다.

**가벼운 모드**는 WebGL2를 사용할 수 없을 때 자동으로 실행됩니다. 렌더링한 집 배경과 2D 캐릭터로 같은 방 이동·충돌·사물 선택·게임을 제공합니다. 방 버튼으로 영역을 확대하거나 스크롤·핀치로 확대·축소할 수 있지만, 자유로운 3D 회전은 지원하지 않습니다.

### 조명과 효과음

상단의 조명을 **자동 / 낮 / 밤** 중 선택합니다. 자동은 기기 현지 시간 기준 **07:00 이상 19:00 미만에는 낮**, 그 밖에는 밤입니다. 위치 권한 없이 동작하며 시간 변화와 탭 복귀 시 갱신합니다. 선택은 브라우저에 저장됩니다.

효과음은 게임의 일시정지·다시 시작 버튼 옆에서 켜거나 끌 수 있습니다. 게임 목록에서는 게임기 아래에 있습니다. 모든 게임에 같은 설정을 적용하고 브라우저에 저장합니다. 외부 음원 없이 Web Audio로 소리를 생성합니다.

### 미니게임

거실의 TV·게임 콘솔 또는 **잠깐, 쉬어가기**를 누릅니다. 목록은 6개씩 두 페이지로 나뉩니다. ↑·↓로 선택하고 ←·→로 페이지를 바꾸며, Enter 또는 터치로 실행합니다. **게임 목록** 버튼으로 돌아갈 수 있습니다.

| 게임 | 규칙 | 조작 |
| --- | --- | --- |
| 블록 쌓기 | 줄을 지우면 남은 조각이 내려와 연쇄를 만드는 캐스케이드 퍼즐 | ←/→ 이동, ↑ 회전, ↓ 한 칸 내리기, Space 바로 내리기 |
| 리듬 탭 | 세 줄의 노트를 타이밍에 맞춰 누르기 | A/S/D·게임판 세 구역 터치·버튼 |
| 카드 맞추기 | 숨은 같은 모양 네 쌍 찾기 | 카드 클릭·터치·Tab/Enter |
| 스네이크 | 사과를 먹고 성장, 벽·몸과 충돌하면 종료 | 방향키/WASD·스와이프·방향 버튼 |
| 벽돌 깨기 | 기회 3번으로 3스테이지의 벽돌 깨기 | 좌우 키·버튼 길게 누르기·드래그 |
| 지뢰찾기 | 8×8 보드에서 지뢰 10개 피하기 | 칸 터치·깃발 모드·우클릭 |
| 소코반 | 상자를 목표 칸으로 미는 5스테이지 퍼즐, 되돌리기 지원 | 방향키/WASD·방향 버튼 |
| 두더지 잡기 | 30초 동안 등장하는 두더지 잡기 | 두더지 터치·Tab/Enter |
| 별빛 슈팅 | 자동 발사로 적을 피하며 세 웨이브 진행 | 좌우 키·버튼 길게 누르기·드래그 |
| 포켓 레이싱 | 점점 빨라지고 교통량이 늘어나는 3차선에서 60초 완주 | 좌우 키·스와이프·방향 버튼 |
| 포켓 퐁 | AI 상대와 7점 선승 | 좌우 키·버튼 길게 누르기·드래그 |
| 플래피 산책 | 장애물 사이로 60초 비행 | Space/↑·게임판 터치·날갯짓 버튼 |

블록 쌓기는 다음 블록·착지 미리보기·점수·레벨을 표시합니다. 10줄마다 낙하 속도가 올라갑니다. 줄이 지워진 뒤 연결된 조각이 내려오며, 새 줄이 완성되면 연쇄 점수를 얻습니다.

시간이 흐르는 게임은 **P** 또는 일시정지 버튼으로 멈춥니다. 다른 창·탭으로 전환하면 자동 일시정지됩니다. 게임을 바꾸거나 모달을 닫으면 해당 판은 초기화되며, 게임 진행과 점수는 저장하지 않습니다. 모바일에서는 게임판 아래 조작 버튼을 사용할 수 있습니다.

## 개발과 검증

### 빌드와 미리보기

```sh
npm run build
npm run preview
```

빌드 결과는 `dist/`에 생성됩니다. 미리보기 주소는 터미널에 표시되며 기본값은 `http://127.0.0.1:4173/`입니다.

### 테스트

```sh
npm run test:unit
npx playwright install chromium
npm run test:browser
npm run build
npm run test:seo
```

- 단위 테스트: 이동·충돌·게임 규칙·낮밤 시간 분류
- 브라우저 테스트: 캐릭터 이동·사물 선택·게임·모바일·가벼운 모드·조명 전환
- SEO 테스트: 빌드된 정적 HTML·공유 메타데이터·사이트맵·404 응답

Linux에서 Chromium 시스템 의존성도 필요하면 `npx playwright install --with-deps chromium`을 사용합니다.

### 프로젝트 구조와 확장

| 파일 | 역할 |
| --- | --- |
| `src/App.jsx` | 방 이동 메뉴·프로젝트 모달·게임 목록 |
| `src/main.jsx` | 브라우저 진입점과 React hydration |
| `src/projects.js` | 프로젝트 정보·서비스 링크·방 안 사물 배치 |
| `src/house-world.js` | 방·출입구·충돌 영역과 공통 이동 계산 |
| `src/room.js` / `src/flat-house.js` | 3D 보기 / 가벼운 모드 |
| `src/games.js` | 게임팩 목록 |
| `src/BlockGame.jsx` / `src/block-game.js` | 블록 게임 UI / 규칙 |
| `src/PuzzleGames.jsx` / `src/puzzle-games.js` | 퍼즐·두더지 게임 UI / 규칙 |
| `src/ActionGame.jsx` / `src/action-games.js` / `src/action-draw.js` | 아케이드 게임 UI·규칙·그리기 |
| `src/game-audio.jsx` | 공통 효과음과 설정 |
| `src/lighting.js` / `src/use-lighting.js` | 낮밤 판정·선택 저장·시간 갱신 |
| `src/studio-theme.css` | 디자인 시스템 토큰을 사용하는 Studio 전용 스타일 |

프로젝트를 추가할 때 `src/projects.js`에 정보와 사물 종류·위치를 지정합니다. `roomLabel`은 방 안 표지판 이름이고 `repo`는 공개 저장소에만 지정합니다. 공간이나 가구를 바꾸면 시각적 배치와 `src/house-world.js`의 충돌 영역도 함께 갱신합니다.

UI는 [Ersione Design System](https://github.com/ersione/ersione-design-system) v0.5.1 패키지의 스타일·React 컴포넌트를 사용합니다. 의존성은 Git 커밋으로 고정되어 있으며 3D 집과 레트로 게임기의 색감은 별도로 유지합니다.

### 공유 이미지와 검색 메타데이터

`index.html`에 OG·Twitter Card·canonical·파비콘을 설정합니다. `scripts/prerender.mjs`는 초기 화면을 정적 HTML로 만들고 구조화 데이터·`robots.txt`·`sitemap.xml`을 생성합니다. 방과 게임은 페이지 내부 기능이므로 사이트맵에는 루트 URL만 포함합니다.

파비콘은 `public/icon.png` 원본에서 만든 `public/favicon.ico`(16·32·48px), `public/favicon-96.png`(96px), `public/apple-touch-icon.png`(180px)를 사용합니다. 브랜드 아이콘을 바꾸면 세 파일도 함께 갱신합니다.

집 배치나 대표 문구를 바꿨다면 Chromium 설치 후 이미지를 갱신합니다.

```sh
npm run update:images
```

실제 3D 집에서 `public/room-preview.png`·`public/house-base.png`와 1200×630 공유 이미지 `public/og-image.png`를 생성합니다. 이미지 생성 후 결과를 확인하세요. 메신저의 기존 미리보기 캐시 반영에는 시간이 걸릴 수 있습니다.

## 배포

`dist/`를 정적 호스팅에 배포할 수 있습니다. Vite의 기본 경로는 `/`이므로 하위 경로에 호스팅하려면 `vite.config.js`와 canonical·OG·사이트맵의 공개 URL을 함께 조정합니다.

이 저장소의 [GitHub Actions 워크플로](.github/workflows/pages.yml)는 `main` 푸시 또는 수동 실행 시 단위·브라우저·SEO 테스트와 빌드를 거쳐 GitHub Pages에 배포합니다. 검색엔진의 실제 수집·색인은 Search Console 등에서 별도로 확인해야 합니다.
