# Ersione’s Studio

개발자의 프로젝트와 실험이 차곡차곡 쌓이는 작은 3D 작업실.

**[작업실 들어가기](https://studio.ersione.com/)**

React + Three.js + Vite로 만든 정적 웹앱입니다. GitHub Pages에서 호스팅하며 서버나 API 키가 필요하지 않습니다.

## 지금 들어있는 것

- 드래그 회전, 스크롤 확대, 처음 시점 복귀가 가능한 3D 방
- Company Lens 모니터, PogoAtlas 도감, Ersione Design System 팔레트 보드
- 프로젝트 설명과 서비스·저장소 링크
- 8장 카드 기억 게임, 밝은/어두운 배경 전환
- 모바일 화면, 키보드로 열 수 있는 프로젝트 목록, 네이티브 모달
- WebGL 미지원 시 정적 방 미리보기와 프로젝트 목록·게임 사용 가능

## 개발

Node.js 24 기준.

```sh
npm ci
npm run dev
npm run build
npx playwright install chromium
npm run test:browser
```

개발 주소는 `/`입니다. `npm run preview`로 배포 결과를 확인합니다.

## 프로젝트 추가

`src/projects.js`에 공개 프로젝트 정보를 추가합니다. `id`, `name`, `subtitle`, `description`, `category`, `color`, `position: [x, y, z]`, `kind`, `url`, `repo`를 지정합니다. 목록과 방의 클릭 대상이 같은 데이터를 사용합니다. `kind`는 `monitor`, `dex`, `palette`이며 생략하면 팔레트 형태로 배치됩니다. 사물이 겹치지 않도록 `position`을 지정하세요.

`src/room.js`는 방과 사물, `src/main.jsx`는 UI와 미니게임, `src/style.css`는 화면 스타일을 담당합니다. 새 게임은 게임기 모달을 확장해서 추가할 수 있습니다.

## 배포

공개 주소는 `https://studio.ersione.com/`입니다. 저장소의 Pages Custom domain에 `studio.ersione.com`을 설정하고, Cloudflare DNS의 Proxied CNAME `studio`를 `ersione.github.io`로 연결합니다. 사용자 HTTPS는 Cloudflare가 처리합니다. 기존 블로그 도메인은 별도로 유지합니다.

`main` push → GitHub Actions에서 빌드와 브라우저 검증 → GitHub Pages 배포. 저장소 Settings → Pages의 Source는 GitHub Actions입니다. `vite.config.js`의 base는 커스텀 도메인 루트에 맞춰 `/`로 설정되어 있습니다. 현재 Cloudflare zone의 기존 SSL Full·Always Use HTTPS 설정을 사용합니다. Full은 원본 인증서의 도메인 일치를 검증하지 않습니다. GitHub Pages 원본 인증서는 별도 발급 대상이며, 발급 완료 후 Pages의 Enforce HTTPS와 원본 인증서 검증을 추가로 확인할 수 있습니다.

## 다음 확장

걸어 다니는 캐릭터, 프로젝트별 방, 추가 미니게임은 아직 구현하지 않았습니다. 현재는 방을 돌려보고 사물을 선택하는 첫 버전입니다. 3D 사물은 코드로 직접 구성했으며, 프로필 아바타는 사용자 사진을 참고해 생성한 일러스트입니다.
