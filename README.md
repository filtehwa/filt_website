# FILT website code widgets

아임웹 `filt.kr` 디자인 편집기에 있는 원본 코드 위젯 백업입니다.

- 복사일: 2026-10-22
- 확인한 메뉴: 19개
- 코드 위젯: 10개 페이지, PC 10개 + 모바일 10개, 총 20개
- 복제 후 삭제한 HOME 페이지는 제외했습니다.
- 각 HTML 파일은 편집기의 코드 전체를 복사했습니다. 줄바꿈은 LF로 통일했으며 코드 내용은 수정하지 않았습니다.
- 원본 사이트에 코드를 저장하거나 게시하지 않았습니다.
- 아임웹 갤러리, 이미지 CDN, 외부 폰트와 페이지 경로 등 기존 의존성을 그대로 보존한 백업입니다. 독립 실행용 사이트로 변환한 결과물은 아닙니다.
- 원본 페이지/메뉴 ID/위젯 ID/글자 수는 `widget-manifest.json`에 기록했습니다.

## 코드 파일

| 원본 페이지 | PC | 모바일 |
|---|---|---|
| #HOME | [home-pc.html](home-pc.html) | [home-mobile.html](home-mobile.html) |
| TEST | [test-pc.html](test-pc.html) | [test-mobile.html](test-mobile.html) |
| #WORKS list | [works-list-pc.html](works-list-pc.html) | [works-list-mobile.html](works-list-mobile.html) |
| #WORKS gallery | [works-gallery-pc.html](works-gallery-pc.html) | [works-gallery-mobile.html](works-gallery-mobile.html) |
| 템프인 사옥 | [tempin-pc.html](tempin-pc.html) | [tempin-mobile.html](tempin-mobile.html) |
| 예인교회 힐링센터 | [yein-healing-center-pc.html](yein-healing-center-pc.html) | [yein-healing-center-mobile.html](yein-healing-center-mobile.html) |
| 연무장 SZF | [yeonmujang-szf-pc.html](yeonmujang-szf-pc.html) | [yeonmujang-szf-mobile.html](yeonmujang-szf-mobile.html) |
| 세종로 성당 신관 | [sejongno-cathedral-pc.html](sejongno-cathedral-pc.html) | [sejongno-cathedral-mobile.html](sejongno-cathedral-mobile.html) |
| #OFFICE | [office-pc.html](office-pc.html) | [office-mobile.html](office-mobile.html) |
| #NEWS | [news-pc.html](news-pc.html) | [news-mobile.html](news-mobile.html) |

## 공통 프로젝트 템플릿

프로젝트 상세 페이지는 공통 화면 템플릿과 프로젝트별 데이터 파일을 분리해서 관리합니다.

- `project-template.js`: 프로젝트 JSON을 불러와 갤러리, 설명, 개요표를 렌더링합니다.
- `project-template.css`: 프로젝트 상세 페이지의 공통 레이아웃과 스타일입니다. 메뉴 배경은 투명하게 유지합니다.
- `projects/<프로젝트ID>.json`: 프로젝트별 이미지, 설명, 캡션, 개요표 데이터입니다.
- `tempin-template-demo.html`: Tempin 데이터를 사용한 단독 미리보기 예시입니다.

이 브랜치는 공통 템플릿과 프로젝트 데이터를 수동으로 관리하는 빌더 없는 버전입니다. 빌더에서 JSON 데이터를 편집하려면 `shared-project-template-builder` 브랜치를 사용하세요.

### 새 프로젝트 추가하기

1. 프로젝트 ID를 영문 소문자와 하이픈으로 정합니다. 예: `yaein-church-interior`
2. `projects/tempin.json`을 복사해 `projects/yaein-church-interior.json`로 만들고 프로젝트별 내용을 수정합니다. 파일의 `id` 값도 파일명과 같은 ID로 설정합니다.
3. `overview.titleEn`, `overview.subtitle`, `overview.fields`에 제목과 개요표 항목을 입력합니다. `fields` 배열에 항목을 추가하거나 제거하면 표 내용에 반영됩니다.
4. 프로젝트 이미지를 저장소에 업로드합니다. 예를 들어 `images/yaein-church-interior/01.jpg`에 추가했다면 배포 후 아래 주소를 이미지 `src`에 사용합니다.

   ```text
   https://filtwebsite-verceltest.vercel.app/images/yaein-church-interior/01.jpg
   ```

   테스트 사이트에 배포한 파일을 기준으로 하는 주소입니다. 배포 호스트가 달라지면 호스트 부분을 실제 배포 주소로 바꿉니다. GitHub의 파일 보기 페이지 주소(`/blob/...`)는 이미지 주소로 사용하지 않습니다.

5. 주 갤러리 이미지마다 `images` 배열에 항목을 추가합니다.

   ```json
   {
     "src": "https://filtwebsite-verceltest.vercel.app/images/yaein-church-interior/01.jpg",
     "class": "landscape",
     "alt": "예인교회 본당",
     "fit": "auto",
     "rotation": 0
   }
   ```

   `class`는 `portrait`, `landscape`, `drawing` 중 하나를 사용하고, `fit`은 `auto`, `contain`, `cover` 중 하나를 사용합니다.

6. 우측 설명은 `descriptionHtml`에 작성합니다. 보조 이미지와 캡션은 `<figure>` / `<figcaption>` 구조로 추가합니다. JSON 문자열 안에서 HTML 속성의 큰따옴표는 `\"`로 입력합니다.

   ```json
   "descriptionHtml": "프로젝트 설명입니다.<br><br><figure class=\"side-figure\"><img class=\"side-single-img\" src=\"https://filtwebsite-verceltest.vercel.app/images/yaein-church-interior/detail-01.jpg\" alt=\"본당 천장 상세\"><figcaption class=\"side-caption\">본당 천장 상세</figcaption></figure>"
   ```

7. 데이터 파일과 이미지 파일을 같은 배포 브랜치에 커밋합니다. 배포가 끝나면 JSON 주소를 열어 확인합니다.

   ```text
   https://filtwebsite-verceltest.vercel.app/projects/yaein-church-interior.json
   ```

### 아임웹에 연결하기

아임웹에서 새 페이지를 만들고 코드 위젯에 아래 코드를 넣습니다. 두 곳의 ID가 JSON의 `id` 및 파일명과 정확히 같아야 합니다.

```html
<div class="filt-project-mount" data-filt-project="yaein-church-interior"></div>
<script src="https://filtwebsite-verceltest.vercel.app/project-template.js" data-project-id="yaein-church-interior"></script>
```

이 코드는 테스트 배포 주소를 사용합니다. 현재 테스트 도메인으로 배포된 브랜치에 템플릿이나 데이터를 커밋하면 해당 브랜치를 불러오는 페이지에 반영됩니다. 별도 작업 브랜치에만 커밋한 내용은 해당 브랜치가 배포되거나 배포 브랜치에 반영되기 전까지 테스트 사이트에 나타나지 않습니다.

예시 프로젝트 확인: [Tempin 공유 템플릿 미리보기](https://filtwebsite-verceltest.vercel.app/tempin-template-demo.html)
