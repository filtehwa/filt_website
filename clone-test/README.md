# 홈 · WORKS · 템프인 복제 테스트

이 폴더는 운영 원본 파일을 그대로 둔 채, 아임웹에서 별도로 시험할 세 페이지의 코드 복제본을 모읍니다. 테스트 목적은 페이지 코드 안에 공통 기능을 복사해 두는 것이 아니라, GitHub에 둔 공통 JavaScript를 각 코드 위젯이 직접 불러와 작동하는지 확인하는 것입니다.

## 페이지 사본

`pages/`에는 세 페이지의 PC·모바일 코드 위젯 사본이 있습니다.

- `home-pc.html`, `home-mobile.html`: 홈 복제본
- `works-pc.html`, `works-mobile.html`: WORKS 복제본
- `tempin-pc.html`, `tempin-mobile.html`: 템프인 복제본

아임웹의 해당 복제 페이지에서 기존 코드 위젯을 교체할 때만 사용합니다. 운영 페이지와 저장소 루트의 원본 백업은 수정하지 않았습니다.

## 공통화한 기능과 삭제/유지 범위

### WORKS 모바일

- 기존 코드의 모바일 메뉴 열기/닫기 처리를 제거하고 `shared/mobile-menu.js`를 직접 불러오게 했습니다.
- WORKS 카테고리 필터와 목록 코드는 그대로 유지했습니다.

### 템프인 모바일

- 기존 코드의 모바일 메뉴 열기/닫기 처리를 제거하고 `shared/mobile-menu.js`를 직접 불러오게 했습니다.
- 면적 단위 전환, 사진 슬라이더, 도면 슬라이더, 이미지 비율 조절은 템프인 전용이므로 그대로 유지했습니다.

### 홈·WORKS·템프인 PC

- 세 페이지의 PC 사본에서 각 페이지의 로고 모핑 코드를 제거하고 `shared/works-project-desktop-common.js`를 직접 불러오게 했습니다. 홈은 기존 로고 모핑 동작을 유지하도록 공통 파일 안에서 홈 모드로 분기합니다.
- WORKS 썸네일 미리보기, 템프인 세로 갤러리·도면·면적 기능은 페이지별 코드로 유지했습니다.

### 홈 PC·모바일

- 홈 갤러리와 고유 기능은 그대로 둡니다. 홈 PC의 로고 모핑은 공통 JavaScript를 통해 작동하고, 홈 모바일은 메뉴가 없는 인트로 화면이므로 메뉴 공통 코드를 불러오지 않습니다.

## 공통 코드 원본

- `shared/mobile-menu.js`: WORKS·템프인 모바일 메뉴
- `shared/works-project-desktop-common.js`: 홈·WORKS·템프인 PC 로고 메뉴 모핑

각 관련 HTML은 `https://cdn.jsdelivr.net/gh/filtehwa/filt_website@tempin-clone-test/clone-test/shared/` 아래의 공통 JavaScript를 `<script src="…">`로 직접 불러옵니다. 별도 부트스트랩 로더는 쓰지 않습니다. GitHub 브랜치의 공통 파일을 수정하면 페이지 복제본의 중복 코드를 다시 편집하지 않아도 됩니다. 브랜치에 변경 사항이 올라간 뒤 CDN 캐시 반영까지 잠시 지연될 수 있습니다.

## 테스트 순서

1. 아임웹에서 숨김 테스트 페이지 세 개를 각각 엽니다.
2. 홈, WORKS, 템프인의 PC·모바일 코드 위젯에 해당 `pages/` 파일을 복사해 넣습니다. 공통 JavaScript URL이 브라우저에서 열리는지 확인한 뒤 메뉴와 로고 동작을 시험합니다.
3. 목록 필터와 템프인 사진·도면·면적 기능도 각 페이지에서 확인합니다.
4. 문제가 있으면 해당 복제본만 수정하고, 정상 동작을 확인한 뒤 공통 코드 범위를 넓힙니다.

`main`에 병합하거나 운영 중인 원본 페이지에 적용하는 단계는 포함하지 않습니다.

## Vercel 미리보기

`index.html`은 테스트 페이지들을 PC·모바일별로 여는 독립 미리보기 시작 화면입니다.

Vercel에서 이 저장소로 새 프로젝트를 만들 때 다음과 같이 설정합니다.

1. GitHub 저장소 `filtehwa/filt_website`를 가져옵니다.
2. Root Directory를 `clone-test`로 지정합니다.
3. Framework Preset은 `Other`를 선택합니다.
4. Build Command는 비우고, Output Directory는 `.`로 둡니다.
5. Production Branch는 `tempin-clone-test`로 지정해 테스트 브랜치만 배포합니다.

이 설정은 저장소 루트의 운영 원본 파일을 배포 대상으로 삼지 않습니다. 실제 도메인은 연결하지 않고 Vercel 미리보기 주소로 확인합니다.
