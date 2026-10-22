const panel = document.querySelector("#mobileMenuPanel");
const menuBtn = document.querySelector("#openMenuBtn");
const overlay = document.querySelector("#menuOverlay"); // 오버레이 추가

// 1. 메뉴 열기
menuBtn.onclick = () => {
  panel.classList.add("open");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden"; // 본문 스크롤 방지
};

// 2. 메뉴 닫기 함수 (공통 사용)
const closeMenu = () => {
  panel.classList.remove("open");
  overlay.classList.remove("active"); // 배경 숨기기
  document.body.style.overflow = ""; // 스크롤 복구
};

// 3. 배경(오버레이) 클릭 시 닫기
overlay.onclick = closeMenu;
  
  
// 이미지 슬라이드 요소 선택
const slidesContainer = document.querySelector('.slides');
const originalImages = document.querySelectorAll('.slides img');
const leftZone = document.querySelector('.click-zone.left');
const rightZone = document.querySelector('.click-zone.right');
const slider = document.querySelector('.detail-slider');

let currentIndex = 1; // 복사본이 앞에 하나 있으므로 1부터 시작
const totalSlides = originalImages.length;
let isTransitioning = false; // 연속 클릭 방지용

// 1. 무한 루프를 위한 클론 생성
const firstClone = originalImages[0].cloneNode(true);
const lastClone = originalImages[totalSlides - 1].cloneNode(true);

slidesContainer.appendChild(firstClone); // 끝에 첫 번째 사진 추가
slidesContainer.insertBefore(lastClone, originalImages[0]); // 처음에 마지막 사진 추가

// 2. 초기 위치 설정 (첫 번째 원본 사진이 보이도록)
slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

// 슬라이드 이동 함수
function updateSlide(animate = true) {
  if (animate) {
    slidesContainer.style.transition = 'transform 0.4s ease-out';
  } else {
    slidesContainer.style.transition = 'none';
  }
  slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// 다음 슬라이드
function nextSlide() {
  if (isTransitioning) return;
  isTransitioning = true;
  currentIndex++;
  updateSlide(true);
}

// 이전 슬라이드
function prevSlide() {
  if (isTransitioning) return;
  isTransitioning = true;
  currentIndex--;
  updateSlide(true);
}

// 3. 순간이동(무한 루프 핵심) 처리
slidesContainer.addEventListener('transitionend', () => {
  isTransitioning = false;
  
  // 마지막 클론(첫 번째 사진의 복사본)에 도달했을 때 -> 진짜 첫 번째로 순간이동
  if (currentIndex === totalSlides + 1) {
    currentIndex = 1;
    updateSlide(false);
  }
  // 첫 번째 클론(마지막 사진의 복사본)에 도달했을 때 -> 진짜 마지막으로 순간이동
  if (currentIndex === 0) {
    currentIndex = totalSlides;
    updateSlide(false);
  }
});

// 클릭 이벤트
leftZone.addEventListener('click', (e) => {
  e.stopPropagation();
  prevSlide();
});

rightZone.addEventListener('click', (e) => {
  e.stopPropagation();
  nextSlide();
});

// 터치 스와이프 로직
let touchStartX = 0;
slider.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].pageX;
}, { passive: true });

slider.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].pageX;
  const deltaX = touchStartX - touchEndX;

  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });

/* ====== 면적(㎡) ↔ 평(py) 토글 (ID 중복/복제 DOM 대응) ====== */
(function () {
  const M2_PER_PY = 3.305785;

  function toPy(m2) {
    return Math.round(m2 / M2_PER_PY); // 반올림, 소수점 없음
  }

  function setAllTo(unit) {
    const cells = document.querySelectorAll('.areaCell');
    cells.forEach(cell => {
      const m2 = Number(cell.dataset.m2);
      if (!Number.isFinite(m2)) return;

      if (unit === 'py') cell.textContent = `${toPy(m2)}py`;
      else cell.textContent = `${m2}㎡`;
      cell.dataset.unit = unit;
    });
  }

  function toggleAll() {
    const cells = document.querySelectorAll('.areaCell');
    const anyPy = Array.from(cells).some(c => c.dataset.unit === 'py');
    setAllTo(anyPy ? 'm2' : 'py');
  }

  // ✅ 이벤트 위임: 복제본/동적 주입에도 항상 동작
  document.addEventListener('click', (e) => {
    const cell = e.target.closest('.areaCell');
    if (!cell) return;
    e.preventDefault();
    e.stopPropagation();
    toggleAll(); // 두 값 모두 같이 토글
  }, true);
})();

/* ====== 도면 슬라이더 ====== */

(function () {

  const drawingSlider =
    document.querySelector('.drawing-slider');

  const drawingSlides =
    document.querySelector('.drawing-slides');

  const drawingImages =
    document.querySelectorAll('.drawing-slides img');

  const drawingLeft =
    document.querySelector('.drawing-click-zone.left');

  const drawingRight =
    document.querySelector('.drawing-click-zone.right');

  const drawingTitle =
    document.querySelector('#drawingTitle');

  const drawingScaleImg =
  document.querySelector('.drawing-scale-img');

  const drawingCoordinateImg =
  document.querySelector('.drawing-coordinate-img');

  function updateScaleBarSize(realIndex) {

  if (!drawingScaleImg && !drawingCoordinateImg) return;

  const currentImage = drawingImages[realIndex];

  if (!currentImage) return;

  const sliderRect =
    drawingSlider.getBoundingClientRect();

  const originalWidth =
    currentImage.naturalWidth;

  const originalHeight =
    currentImage.naturalHeight;

  if (
    !originalWidth ||
    !originalHeight ||
    !sliderRect.width ||
    !sliderRect.height
  ) return;


  /* object-fit: contain의 실제 배율 */
  const scale = Math.min(
    sliderRect.width / originalWidth,
    sliderRect.height / originalHeight
  );


  /* 화면에서 실제 도면이 차지하는 크기 */
  const renderedWidth =
    originalWidth * scale;

  const renderedHeight =
    originalHeight * scale;


  /* 스케일바 */
  if (drawingScaleImg) {

    drawingScaleImg.style.width =
      `${renderedWidth}px`;

    drawingScaleImg.style.height =
      `${renderedHeight}px`;

  }


  /* 좌표 */
  if (drawingCoordinateImg) {

    drawingCoordinateImg.style.width =
      `${renderedWidth}px`;

    drawingCoordinateImg.style.height =
      `${renderedHeight}px`;

  }

}


  if (
    !drawingSlider ||
    !drawingSlides ||
    drawingImages.length === 0
  ) return;


  let drawingIndex = 0;
  let drawingTransitioning = false;


  const drawingTotal =
    drawingImages.length;


  /* 무한루프용 복제 */

  const drawingFirstClone =
    drawingImages[0].cloneNode(true);

  const drawingLastClone =
    drawingImages[drawingTotal - 1].cloneNode(true);


  drawingSlides.appendChild(drawingFirstClone);

  drawingSlides.insertBefore(
    drawingLastClone,
    drawingImages[0]
  );


  let drawingCurrent = 1;


function updateDrawingSlide(animate = true) {

  drawingSlides.style.transition =
    animate
      ? 'transform 0.4s ease-out'
      : 'none';

  drawingSlides.style.transform =
    `translateX(-${drawingCurrent * 100}%)`;


  /* 실제 도면 index */

  let realIndex =
    drawingCurrent - 1;

  if (realIndex < 0)
    realIndex = drawingTotal - 1;

  if (realIndex >= drawingTotal)
    realIndex = 0;


  const currentImage =
    drawingImages[realIndex];


  /* 도면명 */

  drawingTitle.textContent =
    currentImage.dataset.title || '';


  /* 스케일바 + 좌표 크기 */

  updateScaleBarSize(realIndex);


  /* SECTION / ELEVATION에서는 좌표 숨김 */

  if (drawingCoordinateImg) {

    if (currentImage.dataset.coordinate === 'off') {

      drawingCoordinateImg.style.display = 'none';

    } else {

      drawingCoordinateImg.style.display = 'block';

    }

  }

}

  /* 초기 위치 */
  updateDrawingSlide(false);
  function nextDrawing() {
    if (drawingTransitioning) return;
    drawingTransitioning = true;
    drawingCurrent++;
    updateDrawingSlide(true);
  }

  function prevDrawing() {
    if (drawingTransitioning) return;
    drawingTransitioning = true;
    drawingCurrent--;
    updateDrawingSlide(true);
  }


  /* 무한 루프 */

  drawingSlides.addEventListener(
    'transitionend',
    () => {
      drawingTransitioning = false;
      if (
        drawingCurrent ===
        drawingTotal + 1
      ) {
        drawingCurrent = 1;
        updateDrawingSlide(false);
      }


      if (drawingCurrent === 0) {

        drawingCurrent =
          drawingTotal;

        updateDrawingSlide(false);

      }

    }
  );


  /* 좌우 클릭 */

  drawingLeft.addEventListener(
    'click',
    (e) => {

      e.stopPropagation();

      prevDrawing();

    }
  );


  drawingRight.addEventListener(
    'click',
    (e) => {

      e.stopPropagation();

      nextDrawing();

    }
  );


  /* 모바일 스와이프 */

  let drawingTouchStartX = 0;


  drawingSlider.addEventListener(
    'touchstart',
    (e) => {

      drawingTouchStartX =
        e.touches[0].pageX;

    },
    { passive: true }
  );


drawingSlider.addEventListener(
    'touchend',
    (e) => {

      const touchEndX =
        e.changedTouches[0].pageX;

      const deltaX =
        drawingTouchStartX - touchEndX;

      if (Math.abs(deltaX) > 50) {

        if (deltaX > 0)
          nextDrawing();

        else
          prevDrawing();

      }

    },
    { passive: true }
  );


  /* ============================
     화면 크기 변경 대응
     ============================ */

  window.addEventListener('resize', () => {

    let realIndex =
      drawingCurrent - 1;

    if (realIndex < 0)
      realIndex = drawingTotal - 1;

    if (realIndex >= drawingTotal)
      realIndex = 0;

    updateScaleBarSize(realIndex);

  });


  /* ============================
     모바일 화면 회전 대응
     ============================ */

  window.addEventListener('orientationchange', () => {

    setTimeout(() => {

      let realIndex =
        drawingCurrent - 1;

      if (realIndex < 0)
        realIndex = drawingTotal - 1;

      if (realIndex >= drawingTotal)
        realIndex = 0;

      updateScaleBarSize(realIndex);

    }, 100);

  });


})();

document.querySelectorAll('.desc-figures-row').forEach(row => {
  const figures = [...row.querySelectorAll('.desc-figure')];
  const images = figures.map(figure => figure.querySelector('.desc-img'));

  function setFigureRatio() {
    if (!images.every(img => img.naturalWidth && img.naturalHeight)) return;

    images.forEach((img, i) => {
      const ratio = img.naturalWidth / img.naturalHeight;

      figures[i].style.flex = `${ratio} 1 0`;
    });
  }

  images.forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', setFigureRatio);
    }
  });

  setFigureRatio();
});
