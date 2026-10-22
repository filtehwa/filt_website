# 템프인 복제 테스트 파일

아임웹 템프인 상세페이지의 모바일 코드 위젯을 분리해 시험하는 파일입니다. 이 파일들은 `tempin-clone-test` 브랜치 최상위에 있습니다.

- `tempin-copy-content.html`: 페이지 콘텐츠와 위젯 마크업
- `tempin-copy.css`: 페이지 스타일
- `tempin-copy.js`: 메뉴, 사진 슬라이더, 면적 단위 전환, 도면 슬라이더
- `tempin-copy-widget.html`: 복제 페이지의 아임웹 코드 위젯에 붙여넣는 로더

로더는 위 세 파일을 GitHub의 `tempin-clone-test` 브랜치에서 불러옵니다. GitHub에서 파일을 고치면 복제 페이지에서도 해당 코드가 업데이트되는 구조입니다.

원본 백업 `tempin-mobile.html`은 수정하지 않았습니다. 실제 아임웹 복제 페이지에 로더를 넣고 동작을 확인한 뒤 공통 코드를 더 정리해야 합니다.
