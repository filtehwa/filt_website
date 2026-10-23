(() => {
  const script = document.currentScript;
  if (!script) throw new Error("Project template script element is unavailable.");

  const projectId = script.dataset.projectId;
  const mount = projectId
    ? document.querySelector(`[data-filt-project="${CSS.escape(projectId)}"]`)
    : null;
  if (!projectId || !mount) {
    console.error("Project template requires a matching data-filt-project mount and data-project-id.");
    return;
  }

  const templateBase = new URL(".", script.src);
  const addLink = (key, href) => {
    const existing = document.querySelector(`link[data-filt-template="${key}"]`);
    if (existing) return existing.sheet ? Promise.resolve() : new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.filtTemplate = key;
    const loaded = new Promise((resolve, reject) => {
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", reject, { once: true });
    });
    document.head.append(link);
    return loaded;
  };

  const templateStylesReady = addLink("layout", new URL("project-template.css", templateBase).href);
  addLink("suit-font", "https://cdn.jsdelivr.net/npm/suit-font@1.0.0/dist/suit.min.css")
    .catch((error) => console.warn("SUIT font stylesheet could not be loaded.", error));
  addLink("pretendard-font", "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css")
    .catch((error) => console.warn("Pretendard font stylesheet could not be loaded.", error));

  const loadScript = (src) => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const externalScript = document.createElement("script");
    externalScript.src = src;
    externalScript.async = false;
    document.body.append(externalScript);
  };

  const createFieldCell = (tagName, value, className) => {
    const cell = document.createElement(tagName);
    if (className) cell.className = className;
    String(value ?? "").split("\n").forEach((line, index) => {
      if (index) cell.append(document.createElement("br"));
      cell.append(document.createTextNode(line));
    });
    return cell;
  };

  const createOverview = (overview) => {
    const wrapper = document.createElement("div");
    wrapper.className = "fixed-table";
    const table = document.createElement("table");
    const colgroup = document.createElement("colgroup");
    for (let index = 0; index < 4; index += 1) {
      const col = document.createElement("col");
      col.style.width = "25%";
      colgroup.append(col);
    }
    table.append(colgroup);

    const fields = Array.isArray(overview.fields) ? overview.fields : [];
    const titleRow = document.createElement("tr");
    const titleCell = document.createElement("td");
    titleCell.rowSpan = 2;
    titleCell.colSpan = 2;
    titleCell.className = "project-title-cell";
    const title = document.createElement("div");
    title.className = "project-title-en";
    title.textContent = overview.titleEn || "";
    const subtitle = document.createElement("div");
    subtitle.className = "project-subtitle";
    subtitle.textContent = overview.subtitle || "";
    titleCell.append(title, subtitle);
    titleRow.append(titleCell);

    const appendField = (row, field) => {
      if (!field) return;
      row.append(createFieldCell("th", field.label));
      const valueCell = createFieldCell("td", field.value);
      if (field.areaM2 !== undefined && Number.isFinite(Number(field.areaM2))) {
        valueCell.dataset.areaM2 = String(Number(field.areaM2));
        valueCell.dataset.areaUnit = "m2";
        valueCell.addEventListener("click", toggleAreaUnits);
      }
      row.append(valueCell);
    };

    appendField(titleRow, fields[0]);
    table.append(titleRow);
    const secondTitleRow = document.createElement("tr");
    appendField(secondTitleRow, fields[1]);
    table.append(secondTitleRow);

    for (let index = 2; index < fields.length; index += 2) {
      const row = document.createElement("tr");
      appendField(row, fields[index]);
      appendField(row, fields[index + 1]);
      table.append(row);
    }

    wrapper.append(table);
    return wrapper;
  };

  function toggleAreaUnits() {
    const cells = Array.from(mount.querySelectorAll("[data-area-m2]"));
    const showSquareMeters = cells.some((cell) => cell.dataset.areaUnit === "py");
    cells.forEach((cell) => {
      const area = Number(cell.dataset.areaM2);
      cell.textContent = showSquareMeters
        ? `${area.toFixed(2)}㎡`
        : `${Math.round(area / 3.305785)}py`;
      cell.dataset.areaUnit = showSquareMeters ? "m2" : "py";
    });
  }

  const createImageSection = (images) => {
    const section = document.createElement("div");
    section.className = "img-section";
    section.setAttribute("aria-label", "Project images");
    (Array.isArray(images) ? images : []).forEach((image) => {
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt || "";
      img.className = ["portrait", "landscape", "drawing"].includes(image.class) ? image.class : "landscape";
      img.dataset.fit = ["auto", "contain", "cover"].includes(image.fit) ? image.fit : "auto";
      img.dataset.rotation = [0, 90, 180, 270].includes(Number(image.rotation)) ? String(Number(image.rotation)) : "0";
      img.loading = "lazy";
      img.addEventListener("load", () => updateRotatedImageSize(section, img));
      section.append(img, document.createElement("hr"));
    });
    return section;
  };

  const updateRotatedImageSize = (section, image) => {
    if (![90, 270].includes(Number(image.dataset.rotation))) return;
    image.style.setProperty("--rotate-width", `${section.clientHeight}px`);
    image.style.setProperty("--rotate-height", `${section.clientWidth}px`);
  };

  const initializeGallery = (section) => {
    const updateImageMode = () => {
      section.classList.toggle("portrait-mode", section.clientWidth / Math.max(section.clientHeight, 1) <= 1);
      section.querySelectorAll("img").forEach((image) => updateRotatedImageSize(section, image));
    };
    updateImageMode();
    if (window.ResizeObserver) new ResizeObserver(updateImageMode).observe(section);
    window.addEventListener("resize", updateImageMode);

    const originalImages = Array.from(section.querySelectorAll("img"));
    if (originalImages.length < 2) return;
    const firstClone = originalImages[0].cloneNode(true);
    const lastClone = originalImages[originalImages.length - 1].cloneNode(true);
    firstClone.dataset.clone = "1";
    lastClone.dataset.clone = "1";
    section.prepend(document.createElement("hr"), lastClone);
    section.append(document.createElement("hr"), firstClone);

    const images = Array.from(section.querySelectorAll("img"));
    let currentIndex = 1;
    let isJumping = false;
    let endTimer;
    const scrollToIndex = (index, smooth = true) => {
      const image = images[index];
      if (image) section.scrollTo({ top: image.offsetTop, behavior: smooth ? "smooth" : "auto" });
    };
    requestAnimationFrame(() => scrollToIndex(currentIndex, false));
    section.addEventListener("scroll", () => {
      clearTimeout(endTimer);
      endTimer = setTimeout(() => {
        if (isJumping) return;
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        images.forEach((image, index) => {
          const distance = Math.abs(image.offsetTop - section.scrollTop);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        currentIndex = nearestIndex;
        if (currentIndex === 0 || currentIndex === images.length - 1) {
          isJumping = true;
          currentIndex = currentIndex === 0 ? images.length - 2 : 1;
          scrollToIndex(currentIndex, false);
          requestAnimationFrame(() => { isJumping = false; });
        }
      }, 90);
    }, { passive: true });
    section.addEventListener("click", (event) => {
      if (isJumping) return;
      currentIndex += (event.clientY - section.getBoundingClientRect().top) / section.clientHeight <= 0.4 ? -1 : 1;
      scrollToIndex(currentIndex, true);
    });
    section.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("resize", () => requestAnimationFrame(() => scrollToIndex(currentIndex, false)));
  };

  const render = (project) => {
    if (!project || !Array.isArray(project.images) || !project.overview) {
      throw new Error("Project JSON is missing images or overview data.");
    }
    document.title = project.title || `${project.overview.titleEn || project.id} | PROJECT INFO`;
    mount.classList.add("filt-project-mount");
    mount.replaceChildren();

    const main = document.createElement("main");
    main.className = "page-container";
    const imageSection = createImageSection(project.images);
    const sideSection = document.createElement("section");
    sideSection.className = "side-section";
    const toolbar = document.createElement("header");
    toolbar.className = "view-toolbar";
    toolbar.innerHTML = '<div class="view-btns"><a class="integrated-view-btn" href="/works_list" aria-label="Back to works list"><svg class="icon-back" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polyline points="15 18 9 12 15 6"></polyline></svg><svg class="icon-list" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><line y1="0.5" x2="18" y2="0.5" stroke="#000" stroke-width="2"/><line y1="6.17" x2="18" y2="6.17" stroke="#000" stroke-width="4"/><line y1="11.83" x2="18" y2="11.83" stroke="#000" stroke-width="2"/><line y1="17.5" x2="18" y2="17.5" stroke="#000" stroke-width="2"/></svg></a></div>';
    const text = document.createElement("div");
    text.className = "text-content";
    text.innerHTML = project.descriptionHtml || "";
    sideSection.append(toolbar, text, createOverview(project.overview));
    main.append(imageSection, sideSection);
    mount.append(main);
    initializeGallery(imageSection);

    loadScript("https://cdn.jsdelivr.net/gh/filtehwa/filt_website@common-menu/common-menu-v2.js");
    loadScript("https://cdn.jsdelivr.net/gh/filtehwa/filt_website@common-menu/home-button.js");
  };

  const projectDataUrl = new URL(`projects/${encodeURIComponent(projectId)}.json`, templateBase);
  projectDataUrl.searchParams.set("_", String(Date.now()));

  Promise.all([
    templateStylesReady,
    fetch(projectDataUrl, { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error(`Project data request failed (${response.status}).`);
      return response.json();
    })
  ])
    .then(([, project]) => render(project))
    .catch((error) => {
      console.error("Project template could not render.", error);
      const message = document.createElement("p");
      message.className = "filt-template-error";
      message.textContent = `프로젝트를 불러오지 못했습니다: ${error.message}`;
      mount.replaceChildren(message);
    });
})();
