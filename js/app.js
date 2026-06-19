(function () {
  const app = document.getElementById("app");
  const data = window.SafetyData;
  const defaultModule = data.modules[0];
  const STORAGE_KEY = "safetyTrainingResultsV3";
  const DEMO_KEY = "safetyTrainingDemoSeededV3";

  const defaultOrganization = data.trainingCatalog[0];
  const defaultUnit = defaultOrganization.children[0];
  const defaultEquipment = defaultUnit.equipment[0];

  const state = {
    view: "home",
    selection: {
      organizationId: defaultOrganization.id,
      unitId: defaultUnit.id,
      equipmentId: defaultEquipment.id
    },
    employee: {
      name: "",
      tabNumber: "",
      position: "",
      email: ""
    },
    videoSeen: false,
    videoMissing: false,
    videoCanContinue: false,
    learningIndex: 0,
    visitedLearning: new Set(),
    miniAnswers: {},
    activeTabs: {},
    activeHotspots: {},
    expandedCards: {},
    checklistTicks: {},
    testAnswers: {},
    result: null,
    journalFilters: {
      search: "",
      organization: "",
      equipment: ""
    }
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function byId(items, id) {
    return items.find((item) => item.id === id);
  }

  function selectedOrganization() {
    return byId(data.trainingCatalog, state.selection.organizationId) || data.trainingCatalog[0];
  }

  function selectedUnit() {
    const organization = selectedOrganization();
    return byId(organization.children, state.selection.unitId) || organization.children[0];
  }

  function selectedEquipment() {
    const unit = selectedUnit();
    return byId(unit.equipment || [], state.selection.equipmentId) || (unit.equipment || [])[0] || null;
  }

  function selectedModule() {
    const equipment = selectedEquipment();
    if (!equipment) {
      return null;
    }
    return data.modules.find((item) => item.equipmentId === equipment.id) || null;
  }

  function findReadyPath() {
    for (const organization of data.trainingCatalog) {
      for (const unit of organization.children) {
        const equipment = (unit.equipment || []).find((item) => item.status === "ready");
        if (equipment) {
          return { organization, unit, equipment };
        }
      }
    }
    return { organization: defaultOrganization, unit: defaultUnit, equipment: defaultEquipment };
  }

  function typeLabel(type) {
    return {
      department: "Отдел",
      laboratory: "Лаборатория",
      sector: "Сектор",
      center: "Центр"
    }[type] || "Подразделение";
  }

  function typeIcon(type) {
    return {
      department: "department",
      laboratory: "lab",
      sector: "sector",
      center: "center"
    }[type] || "building";
  }

  function organizationDescription(organization) {
    return {
      rusniti: "готовый модуль",
      "ic-tmk": "каталог создан"
    }[organization.id] || "структура проекта";
  }

  function unitDescription(unit) {
    const hasReady = (unit.equipment || []).some((equipment) => equipment.status === "ready");
    return hasReady ? "ИОТ-47 доступна" : "модуль готовится";
  }

  function statusText(equipment) {
    if (!equipment) {
      return "Обучающий модуль в разработке";
    }
    return equipment.status === "ready" ? "Готово к прохождению" : "Обучающий модуль в разработке";
  }

  function isReadyEquipment(equipment) {
    return Boolean(equipment && equipment.status === "ready" && selectedModule());
  }

  function setView(view) {
    state.view = view;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncUnitSelection() {
    const organization = selectedOrganization();
    if (!organization.children.some((unit) => unit.id === state.selection.unitId)) {
      state.selection.unitId = organization.children[0].id;
    }
    const equipment = selectedEquipment();
    state.selection.equipmentId = equipment ? equipment.id : "";
  }

  function loadResults() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      console.warn("Не удалось прочитать журнал", error);
      return [];
    }
  }

  function storeResults(results) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }

  function saveResult(record) {
    const results = loadResults();
    results.unshift(record);
    storeResults(results);
  }

  function ensureDemoResults() {
    if (localStorage.getItem(DEMO_KEY)) {
      return;
    }

    const { organization, unit, equipment } = findReadyPath();
    const now = Date.now();
    const demo = [
      {
        id: "demo-1",
        demo: true,
        date: new Date(now - 86400000).toISOString(),
        employeeName: "Иванов Сергей Петрович",
        tabNumber: "0142",
        position: "инженер-испытатель",
        email: "ivanov@example.com",
        organization: organization.name,
        department: unit.name,
        equipment: equipment.name,
        installation: equipment.name,
        instruction: equipment.instruction,
        moduleId: defaultModule.id,
        score: 9,
        total: 10,
        percent: 90,
        passed: true,
        certificateId: "IOT47-DEMO-0001",
        answers: []
      }
    ];

    storeResults([...demo, ...loadResults()]);
    localStorage.setItem(DEMO_KEY, "1");
  }

  function renderSteps(active) {
    const steps = [
      ["identity", "Данные"],
      ["unit", "Подразделение"],
      ["equipment", "Установка"],
      ["video", "Видео"],
      ["learning", "Обучение"],
      ["test", "Тест"],
      ["certificate", "Сертификат"]
    ];
    const activeIndex = steps.findIndex(([id]) => id === active);
    const progress = Math.max(0, Math.round(((activeIndex + 1) / steps.length) * 100));

    return `
      <div class="journey-stepper no-print" style="--journey-progress:${progress}%">
        <div class="journey-progress" aria-hidden="true"><span></span></div>
        <ol class="stepper compact" aria-label="Этапы обучения">
          ${steps
            .map(([id, label], index) => {
              const status = index < activeIndex ? "done" : index === activeIndex ? "active" : "";
              return `<li class="${status}"><span>${index + 1}</span>${escapeHtml(label)}</li>`;
            })
            .join("")}
        </ol>
      </div>
    `;
  }

  function renderBreadcrumbs(includeEquipment = true) {
    const organization = selectedOrganization();
    const unit = selectedUnit();
    const equipment = selectedEquipment();
    const parts = [organization.name, unit.name];
    if (includeEquipment && equipment) {
      parts.push(equipment.shortName || equipment.name);
    }

    return `
      <nav class="breadcrumbs no-print" aria-label="Выбранный маршрут">
        ${parts.map((part) => `<span>${escapeHtml(part)}</span>`).join("")}
      </nav>
    `;
  }

  function renderRoutePreview(includeEquipment = false) {
    const equipment = selectedEquipment();
    const nodes = [
      { label: "Организация", value: selectedOrganization().name, status: "done" },
      { label: typeLabel(selectedUnit().type), value: selectedUnit().name, status: "active" }
    ];

    if (includeEquipment) {
      nodes.push({
        label: "Установка",
        value: equipment ? equipment.name : "Модуль в разработке",
        status: equipment ? "done" : "draft"
      });
    }

    return `
      <div class="route-preview no-print" aria-label="Каскад выбранного маршрута">
        ${nodes
          .map(
            (node, index) => `
              <article class="${node.status}">
                <span>${index + 1}</span>
                <small>${escapeHtml(node.label)}</small>
                <strong>${escapeHtml(node.value)}</strong>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function resetLearningProgress() {
    state.videoSeen = false;
    state.videoMissing = false;
    state.videoCanContinue = false;
    state.learningIndex = 0;
    state.visitedLearning = new Set();
    state.miniAnswers = {};
    state.testAnswers = {};
    state.activeHotspots = {};
    state.expandedCards = {};
    state.checklistTicks = {};
    state.result = null;
  }

  function renderHome() {
    const benefits = [
      { icon: "clock", title: "Быстрое обучение", text: "по модулю ИОТ-47" },
      { icon: "quiz", title: "Контроль знаний", text: "проходной балл 80%" },
      { icon: "certificate", title: "Сертификаты", text: "печать и журнал" }
    ];

    app.innerHTML = `
      <section class="hero employee-home minimal-home">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="hero-content">
          <p class="hero-kicker">Индустриальное обучение по ОТ</p>
          <h1>${escapeHtml(data.project.title)}</h1>
          <p>${escapeHtml(data.project.subtitle)}</p>
          <p class="hero-slogan">Инструктаж, тест и сертификат в одном маршруте.</p>
          <div class="home-benefits" aria-label="Преимущества обучения">
            ${benefits
              .map(
                (item) => `
                  <article>
                    <span>${renderIcon(item.icon)}</span>
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.text)}</small>
                  </article>
                `
              )
              .join("")}
          </div>
          <div class="hero-actions single-action">
            <button class="btn primary" type="button" data-action="go" data-view="identity">Пройти обучение</button>
          </div>
        </div>
        <aside class="hero-module-card" aria-label="Активный модуль">
          <span>Активный модуль</span>
          <strong>Hitachi B16RM</strong>
          <p>вращение · стружка · электрика</p>
        </aside>
      </section>

      <div class="home-admin-footer no-print">
        <button class="admin-link" type="button" data-action="go" data-view="admin">служебный доступ</button>
      </div>
    `;
  }

  function renderIdentity() {
    app.innerHTML = `
      ${renderSteps("identity")}
      <section class="screen-grid">
        <div class="screen-heading">
          <p class="eyebrow">Шаг 1</p>
          <h2>Идентификация сотрудника</h2>
          <p>Эти данные попадут в сертификат и уведомление по охране труда.</p>
        </div>

        <form class="form-panel identity-panel" id="identityForm" novalidate>
          <div class="form-row">
            <label class="field-card">
              <span>ФИО</span>
              <div class="input-shell">
                <i>${renderIcon("user")}</i>
                <input name="employeeName" aria-label="ФИО" value="${escapeHtml(state.employee.name)}" autocomplete="name" required autofocus placeholder="Фамилия Имя Отчество">
              </div>
              <small>для сертификата</small>
            </label>
            <label class="field-card">
              <span>Табельный номер</span>
              <div class="input-shell">
                <i>${renderIcon("id")}</i>
                <input name="tabNumber" aria-label="Табельный номер" value="${escapeHtml(state.employee.tabNumber)}" inputmode="numeric" required placeholder="0000">
              </div>
              <small>для журнала</small>
            </label>
          </div>
          <div class="form-row">
            <label class="field-card">
              <span>Должность</span>
              <div class="input-shell">
                <i>${renderIcon("briefcase")}</i>
                <input name="position" aria-label="Должность" value="${escapeHtml(state.employee.position)}" required placeholder="инженер-испытатель">
              </div>
              <small>для уведомления</small>
            </label>
            <label class="field-card">
              <span>E-mail, если есть</span>
              <div class="input-shell">
                <i>${renderIcon("mail")}</i>
                <input name="email" aria-label="E-mail, если есть" type="email" value="${escapeHtml(state.employee.email)}" placeholder="name@example.com">
              </div>
              <small>необязательно</small>
            </label>
          </div>
          <div class="form-actions">
            <button class="btn ghost" type="button" data-action="go" data-view="home">Назад</button>
            <button class="btn primary" type="submit">Продолжить</button>
          </div>
        </form>
      </section>
    `;

    document.getElementById("identityForm").addEventListener("submit", (event) => {
      event.preventDefault();
      event.currentTarget.querySelectorAll(".field-card").forEach((field) => field.classList.remove("is-invalid"));
      const formData = new FormData(event.currentTarget);
      state.employee = {
        name: String(formData.get("employeeName") || "").trim(),
        tabNumber: String(formData.get("tabNumber") || "").trim(),
        position: String(formData.get("position") || "").trim(),
        email: String(formData.get("email") || "").trim()
      };

      if (!state.employee.name || !state.employee.tabNumber || !state.employee.position) {
        event.currentTarget.querySelectorAll("input[required]").forEach((input) => {
          if (!input.value.trim()) {
            input.closest(".field-card")?.classList.add("is-invalid");
          }
        });
        const firstInvalid = event.currentTarget.querySelector(".field-card.is-invalid input");
        if (firstInvalid) {
          firstInvalid.focus();
        }
        showToast("Заполните ФИО, табельный номер и должность");
        return;
      }

      setView("unit");
    });

    document.getElementById("identityForm").querySelectorAll("input[required]").forEach((input) => {
      input.addEventListener("input", () => input.closest(".field-card")?.classList.remove("is-invalid"));
    });
  }

  function renderUnitSelection() {
    const organization = selectedOrganization();

    app.innerHTML = `
      ${renderSteps("unit")}
      <section class="choice-shell">
        <div class="screen-heading">
          <p class="eyebrow">Шаг 2</p>
          <h2>Выбор подразделения</h2>
          <p>Выберите организацию, затем конкретный отдел, лабораторию, сектор или центр из каталога проекта.</p>
        </div>

        <div class="choice-stage">
          <div class="choice-stage-head">
            <span>1</span>
            <div>
              <h3>Организация</h3>
              <p>Сначала выберите юридическую площадку.</p>
            </div>
          </div>
          <div class="choice-grid organization-grid">
            ${data.trainingCatalog
              .map(
                (item) => `
                  <button class="selection-card ${item.id === state.selection.organizationId ? "active" : ""}" type="button" data-action="select-organization" data-id="${escapeHtml(item.id)}">
                    <span class="selection-icon">${renderIcon("building")}</span>
                    <span class="choice-type">Организация</span>
                    <strong>${escapeHtml(item.name)}</strong>
                    <p>${escapeHtml(organizationDescription(item))}</p>
                    <small>${item.children.length} направлений</small>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="choice-stage">
          <div class="choice-stage-head">
            <span>2</span>
            <div>
              <h3>Отдел / лаборатория / сектор</h3>
              <p>Список меняется в зависимости от выбранной организации.</p>
            </div>
          </div>
          <div class="choice-grid unit-grid">
            ${organization.children
              .map((unit) => {
                const hasReady = (unit.equipment || []).some((equipment) => equipment.status === "ready");
                return `
                  <button class="selection-card unit-card ${unit.id === state.selection.unitId ? "active" : ""}" type="button" data-action="select-unit" data-id="${escapeHtml(unit.id)}">
                    <span class="selection-icon">${renderIcon(typeIcon(unit.type))}</span>
                    <span class="choice-type">${escapeHtml(typeLabel(unit.type))}</span>
                    <strong>${escapeHtml(unit.name)}</strong>
                    <p>${escapeHtml(unitDescription(unit))}</p>
                    <small>${hasReady ? "есть готовый модуль" : "модуль в разработке"}</small>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>

        ${renderBreadcrumbs(false)}
        ${renderRoutePreview(false)}

        <div class="action-strip no-print">
          <button class="btn ghost" type="button" data-action="go" data-view="identity">Назад</button>
          <button class="btn primary" type="button" data-action="continue-unit">Выбрать установку</button>
        </div>
      </section>
    `;
  }

  function renderEquipmentSelection() {
    const unit = selectedUnit();
    const equipmentItems = unit.equipment || [];
    const equipment = selectedEquipment();

    app.innerHTML = `
      ${renderSteps("equipment")}
      <section class="equipment-card-screen">
        <div class="screen-heading">
          <p class="eyebrow">Шаг 3</p>
          <h2>Выбор установки</h2>
          <p>Для готовых модулей можно сразу начать обучение. Для остальных направлений показана заглушка.</p>
        </div>

        ${renderBreadcrumbs(Boolean(equipment))}
        ${renderRoutePreview(true)}

        <div class="installation-grid">
          ${
            equipmentItems.length
              ? equipmentItems.map((item) => renderEquipmentCard(item, item.id === state.selection.equipmentId)).join("")
              : renderPlaceholderCard(unit)
          }
        </div>

        <div class="action-strip no-print">
          <button class="btn ghost" type="button" data-action="go" data-view="unit">Назад</button>
          ${
            isReadyEquipment(equipment)
              ? '<button class="btn primary" type="button" data-action="begin-training">Начать обучение</button>'
              : '<button class="btn primary" type="button" disabled>Модуль в разработке</button>'
          }
        </div>
      </section>
    `;
  }

  function renderEquipmentCard(equipment, active) {
    const ready = equipment.status === "ready";
    return `
      <button class="installation-card ${active ? "active" : ""} ${ready ? "ready" : "disabled"}" type="button" data-action="select-equipment" data-id="${escapeHtml(equipment.id)}">
        <span class="equipment-status ${ready ? "status-ready" : "status-draft"}">${escapeHtml(statusText(equipment))}</span>
        <strong>${escapeHtml(equipment.name)}</strong>
        <small>Инструкция: ${escapeHtml(equipment.instruction || "не назначена")}</small>
        <small>Подразделение: ${escapeHtml(selectedUnit().name)}</small>
        <div class="risk-badges">
          ${(equipment.riskBadges || []).map((risk) => `<b>${escapeHtml(risk)}</b>`).join("")}
        </div>
      </button>
    `;
  }

  function renderPlaceholderCard(unit) {
    return `
      <article class="installation-card placeholder-card">
        <span class="equipment-status status-draft">Обучающий модуль в разработке</span>
        <strong>${escapeHtml(unit.name)}</strong>
        <small>Для этого подразделения установка еще не подключена к цифровому обучению.</small>
        <div class="risk-badges">
          <b>каталог создан</b>
          <b>материалы готовятся</b>
        </div>
      </article>
    `;
  }

  function renderVideo() {
    const equipment = selectedEquipment();
    if (!isReadyEquipment(equipment)) {
      setView("equipment");
      return;
    }

    app.innerHTML = `
      ${renderSteps("video")}
      <section class="learning-layout">
        <div class="screen-heading">
          <p class="eyebrow">Видео</p>
          <h2>${escapeHtml(equipment.name)}</h2>
          <p>${escapeHtml(equipment.instruction)} · короткий разбор рисков перед практическими модулями.</p>
        </div>

        ${renderBreadcrumbs()}

        <div class="video-shell">
          <video id="trainingVideo" class="${state.videoMissing ? "is-hidden" : ""}" controls playsinline preload="metadata" poster="assets/img/industrial-safety-panel.png">
            <source src="${escapeHtml(equipment.video)}" type="video/mp4">
          </video>
          <div id="videoFallback" class="video-fallback ${state.videoMissing ? "" : "is-hidden"}">
            <span class="fallback-mark"></span>
            <h3>Видео будет подключено позже</h3>
            <p>Файл ${escapeHtml(equipment.video)} не найден. Для демонстрации можно продолжить интерактивное обучение.</p>
          </div>
          <aside class="video-insight-panel">
            <span>В фокусе</span>
            <strong>Вращение · стружка · электрика</strong>
            <p>Смотрите, где нельзя держать руки и когда нужно остановить станок.</p>
          </aside>
        </div>

        <div class="action-strip no-print">
          <button class="btn ghost" type="button" data-action="go" data-view="equipment">Назад</button>
          <span id="videoStatusHint" class="video-status-hint ${state.videoCanContinue || state.videoMissing ? "is-hidden" : ""}">Кнопка появится после просмотра.</span>
          <button id="videoContinueButton" class="btn primary ${state.videoCanContinue || state.videoMissing ? "" : "is-hidden"}" type="button" data-action="mark-video">Видео просмотрено</button>
        </div>
      </section>
    `;

    const video = document.getElementById("trainingVideo");
    const fallback = document.getElementById("videoFallback");
    const continueButton = document.getElementById("videoContinueButton");
    const statusHint = document.getElementById("videoStatusHint");
    const unlockVideo = () => {
      state.videoCanContinue = true;
      continueButton.classList.remove("is-hidden");
      statusHint.classList.add("is-hidden");
    };
    const showFallback = () => {
      state.videoMissing = true;
      unlockVideo();
      video.classList.add("is-hidden");
      fallback.classList.remove("is-hidden");
    };
    video.addEventListener("error", showFallback);
    video.querySelector("source").addEventListener("error", showFallback);
    video.addEventListener("ended", unlockVideo);
    video.addEventListener("timeupdate", () => {
      if (video.duration && video.currentTime / video.duration > 0.96) {
        unlockVideo();
      }
    });
  }

  function badgeClassForRisk(riskClass) {
    return {
      critical: "risk-critical",
      high: "risk-high",
      medium: "risk-medium",
      low: "risk-low",
      control: "risk-control"
    }[riskClass] || "risk-medium";
  }

  function learningBadge(block) {
    if (block.id === "forbidden-actions") {
      return { label: "Запрещено", className: "badge-forbidden" };
    }
    if (block.id === "emergency-situations" || block.id === "emergency-algorithm") {
      return { label: "Авария", className: "badge-emergency" };
    }
    if (block.riskClass === "critical" || block.riskClass === "high" || block.id === "hazard-map") {
      return { label: "Опасность", className: "badge-danger" };
    }
    return { label: "Обязательно", className: "badge-mandatory" };
  }

  function learningMetaCards(block) {
    const tags = {
      "hazard-map": [
        ["Опасность", "вращение", "danger"],
        ["Риск", "стружка", "warning"],
        ["Контроль", "электрика", "info"]
      ],
      "admission-checklist": [
        ["Обязательно", "допуск", "info"],
        ["Проверка", "СИЗ", "safe"],
        ["Контроль", "место", "safe"]
      ],
      "ppe-cards": [
        ["Обязательно", "очки", "info"],
        ["Безопасно", "одежда", "safe"],
        ["Проверка", "исправность", "warning"]
      ],
      "machine-check": [
        ["Опасность", "электрика", "danger"],
        ["Проверка", "пуск/стоп", "info"],
        ["Обязательно", "заземление", "safe"]
      ],
      "part-fixing": [
        ["Опасность", "проворот", "danger"],
        ["Правильно", "тиски", "safe"],
        ["Запрещено", "руками", "danger"]
      ],
      "safe-drilling": [
        ["Процесс", "подача", "info"],
        ["Внимание", "выход сверла", "warning"],
        ["Контроль", "вибрация", "danger"]
      ],
      "forbidden-actions": [
        ["Запрещено", "руки", "danger"],
        ["Запрещено", "патрон", "danger"],
        ["Стоп", "неисправность", "warning"]
      ],
      "emergency-situations": [
        ["Авария", "пожар", "danger"],
        ["Авария", "ток", "danger"],
        ["Службы", "101/112/103", "warning"]
      ],
      "emergency-algorithm": [
        ["Алгоритм", "стоп", "danger"],
        ["Связь", "руководитель", "info"],
        ["Помощь", "103", "warning"]
      ],
      "finish-work": [
        ["Финал", "питание", "safe"],
        ["Порядок", "стружка", "warning"],
        ["Контроль", "замечания", "info"]
      ]
    }[block.id] || [["Риск", block.riskLevel, "info"]];

    return `
      <div class="learning-meta-grid" aria-label="Ключевые акценты экрана">
        ${tags
          .map(
            ([label, value, tone]) => `
              <article class="learning-meta-card ${tone}">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderIcon(name) {
    const icons = {
      rotate:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3v4h-4"/><path d="M7 21v-4h4"/><path d="M18.6 8.7A7 7 0 0 0 6.3 6"/><path d="M5.4 15.3A7 7 0 0 0 17.7 18"/></svg>',
      chips:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 15 5-2 2 5-5 2Z"/><path d="m13 4 6 3-3 6-6-3Z"/><path d="m15 16 4 1-1 4-4-1Z"/></svg>',
      bolt:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h6l-1 8 8-12h-6Z"/></svg>',
      shield:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v6c0 4.5 2.8 7.5 7 9 4.2-1.5 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-5"/></svg>',
      eye:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="3"/></svg>',
      suit:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l3 4-3 3v11H8V10L5 7Z"/><path d="M10 3v5l2 2 2-2V3"/></svg>',
      shoe:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c4 0 6-2 8-5l3 4 5 2v3H4Z"/><path d="M4 18h16"/></svg>',
      check:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
      wrench:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0 5 5L10 21H5v-5Z"/><path d="m13 8 3 3"/></svg>',
      clamp:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v4H7Z"/><path d="M9 8v12"/><path d="M15 8v12"/><path d="M6 20h12"/><path d="M8 13h8"/></svg>',
      stop:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l5 5v8l-5 5H8l-5-5V8Z"/><path d="M9 9l6 6"/><path d="m15 9-6 6"/></svg>',
      fire:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 .2 2-.5 3.3-1.6 4.3C13.6 8.5 11 5.8 8 3c.4 4-3 6-3 11 0 4.4 3 8 7 8Z"/></svg>',
      alert:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20Z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>',
      clean:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19h14"/><path d="m8 19 1-8h6l1 8"/><path d="M10 11V5h4v6"/><path d="M7 5h10"/></svg>',
      building:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V6l8-4 8 4v15"/><path d="M9 21v-7h6v7"/><path d="M8 8h.01"/><path d="M12 8h.01"/><path d="M16 8h.01"/></svg>',
      department:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V5h8v15"/><path d="M12 9h8v11"/><path d="M7 8h2"/><path d="M7 12h2"/><path d="M15 12h2"/><path d="M15 16h2"/></svg>',
      lab:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2h6"/><path d="M10 2v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V2"/><path d="M7.5 16h9"/></svg>',
      sector:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/><path d="M8 5v14"/><path d="M16 5v14"/></svg>',
      center:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"/><path d="M3 12h18"/><path d="m6 6 12 12"/><path d="m18 6-12 12"/></svg>',
      user:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
      id:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4"/><path d="M7 12h5"/><path d="M15 12h2"/><path d="M15 16h2"/></svg>',
      briefcase:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1"/><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 12h18"/></svg>',
      mail:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
      clock:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
      quiz:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9a3 3 0 1 1 5 2.2c-1 .7-2 1.3-2 2.8"/><path d="M12 18h.01"/><path d="M4 4h16v16H4Z"/></svg>',
      certificate:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6"/><path d="M9 12h6"/></svg>'
    };
    return icons[name] || icons.check;
  }

  function pointIcon(block, index) {
    const byType = {
      "hazard-map": ["rotate", "chips", "clamp", "bolt", "alert"],
      checklist: ["check", "shield", "eye", "wrench", "clamp"],
      ppe: ["suit", "eye", "check", "shield"],
      inspection: ["rotate", "wrench", "stop", "bolt", "shield"],
      compare: ["clamp", "check", "stop", "alert"],
      drilling: ["check", "clamp", "rotate", "alert", "eye"],
      forbidden: ["stop", "stop", "wrench", "eye", "alert"],
      scenarios: ["fire", "bolt", "alert", "wrench", "shield"],
      algorithm: ["stop", "bolt", "user", "shield", "alert"],
      finish: ["bolt", "clean", "wrench", "chips", "check"]
    };
    return (byType[block.visualType] || ["check"])[index] || "check";
  }

  function renderLearningPoints(block) {
    return `
      <div class="learning-point-grid" aria-label="Ключевые тезисы">
        ${block.points
          .slice(0, 5)
          .map(
            (item, index) => `
              <article>
                <span>${renderIcon(pointIcon(block, index))}</span>
                <p>${escapeHtml(item)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderLearningTabs(block) {
    const tabs = block.visual?.tabs || [];
    if (!tabs.length) {
      return "";
    }

    const activeIndex = state.activeTabs[block.id] ?? 0;
    const activeTab = tabs[activeIndex] || tabs[0];

    return `
      <section class="learning-tabs" aria-label="Дополнительные акценты">
        <div class="tabs-list" role="tablist">
          ${tabs
            .map(
              (tab, index) => `
                <button class="${index === activeIndex ? "active" : ""}" type="button" role="tab" data-action="select-tab" data-block="${escapeHtml(block.id)}" data-tab="${index}">
                  ${escapeHtml(tab.label)}
                </button>
              `
            )
            .join("")}
        </div>
        <article class="tab-panel" role="tabpanel">
          <span>${escapeHtml(activeTab.kicker || "Акцент")}</span>
          <strong>${escapeHtml(activeTab.title)}</strong>
          <p>${escapeHtml(activeTab.text)}</p>
        </article>
      </section>
    `;
  }

  function renderLearningAccordion(block) {
    const items = block.visual?.accordion || [];
    if (!items.length) {
      return "";
    }

    return `
      <section class="learning-accordion" aria-label="Раскрывающиеся детали">
        ${items
          .map(
            (item, index) => `
              <details ${index === 0 ? "open" : ""}>
                <summary>${escapeHtml(item.title)}</summary>
                <p>${escapeHtml(item.text)}</p>
              </details>
            `
          )
          .join("")}
      </section>
    `;
  }

  function renderLearningInteraction(block) {
    const tabs = renderLearningTabs(block);
    const accordion = renderLearningAccordion(block);

    if (!tabs && !accordion) {
      return "";
    }

    return `
      <div class="learning-module-interaction">
        ${tabs}
        ${accordion}
      </div>
    `;
  }

  function renderBlockVisual(block) {
    const visual = block.visual || {};

    if (block.visualType === "hazard-map") {
      const markers = visual.markers || [];
      const activeIndex = state.activeHotspots[block.id] ?? 0;
      const activeMarker = markers[activeIndex] || markers[0];
      return `
        <div class="learning-visual hazard-map-visual">
          <div class="machine-map" aria-label="Схема опасных зон станка">
            <div class="machine-glow"></div>
            <div class="machine-head"></div>
            <div class="machine-spindle"></div>
            <div class="machine-table"></div>
            <div class="machine-base"></div>
            ${markers
              .map(
                (marker, index) => `
                  <button class="hotspot ${index === activeIndex ? "active" : ""}" type="button" data-action="select-hotspot" data-index="${index}" style="left:${marker.x}%; top:${marker.y}%;">
                    <i>${index + 1}</i>
                    <b>${escapeHtml(marker.label)}</b>
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="hotspot-list">
            ${activeMarker ? `
              <article class="hotspot-panel">
                <span class="mini-icon">${renderIcon(activeMarker.icon || "alert")}</span>
                <div>
                  <strong>${escapeHtml(activeMarker.label)}</strong>
                  <p>${escapeHtml(activeMarker.note)}</p>
                </div>
              </article>
            ` : ""}
            ${markers
              .map(
                (marker, index) => `
                  <button class="${index === activeIndex ? "active" : ""}" type="button" data-action="select-hotspot" data-index="${index}">
                    <span class="mini-icon">${renderIcon(marker.icon || "alert")}</span>
                    <span>
                      <strong>${index + 1}. ${escapeHtml(marker.label)}:</strong>
                      ${escapeHtml(marker.note)}
                    </span>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    if (block.visualType === "checklist") {
      return `
        <div class="learning-visual checklist-grid">
          ${(visual.items || [])
            .map((item, index) => {
              const value = typeof item === "string" ? { title: item, icon: "check" } : item;
              const checkKey = `${block.id}:${index}`;
              return `
                <button class="check-card ${state.checklistTicks[checkKey] ? "checked" : ""}" type="button" data-action="toggle-check" data-check="${escapeHtml(checkKey)}">
                  <span>${renderIcon(value.icon || "check")}</span>
                  <strong>${escapeHtml(value.title)}</strong>
                  ${value.text ? `<p>${escapeHtml(value.text)}</p>` : ""}
                </button>
              `;
            })
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "ppe") {
      return `
        <div class="learning-visual ppe-grid">
          ${(visual.cards || [])
            .map(
              (card, index) => {
                const cardKey = `${block.id}:${index}`;
                const expanded = Boolean(state.expandedCards[cardKey]);
                return `
                <button class="ppe-card ${expanded ? "expanded" : ""}" type="button" data-action="toggle-card" data-card="${escapeHtml(cardKey)}">
                  <span class="visual-icon">${renderIcon(card.icon || "shield")}</span>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                  <small>${expanded ? escapeHtml(card.details || "Проверьте посадку и исправность перед запуском.") : "Нажмите для деталей"}</small>
                </button>
              `;
              }
            )
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "inspection") {
      return `
        <div class="learning-visual inspection-grid">
          ${(visual.checks || [])
            .map(
              (check) => `
                <article>
                  <span class="inspection-dot">${renderIcon(check.icon || "check")}</span>
                  <div>
                    <strong>${escapeHtml(check.title)}</strong>
                    <p>${escapeHtml(check.status)}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "compare") {
      return `
        <div class="learning-visual compare-grid">
          <article class="compare-card good">
            <span>Правильно</span>
            <div class="fixture-illustration good" aria-hidden="true">
              <i class="fixture-base"></i>
              <i class="fixture-vise"></i>
              <i class="fixture-part"></i>
              <i class="fixture-drill"></i>
            </div>
            ${(visual.good || []).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
          </article>
          <article class="compare-card bad">
            <span>Неправильно</span>
            <div class="fixture-illustration bad" aria-hidden="true">
              <i class="fixture-base"></i>
              <i class="fixture-hand left"></i>
              <i class="fixture-hand right"></i>
              <i class="fixture-part"></i>
              <i class="fixture-drill"></i>
            </div>
            ${(visual.bad || []).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
          </article>
        </div>
      `;
    }

    if (block.visualType === "flow") {
      return `
        <div class="learning-visual flow-visual">
          ${(visual.steps || [])
            .map(
              (step, index) => `
                <article>
                  <span class="flow-index">${index + 1}</span>
                  <div class="visual-icon">${renderIcon(step.icon || "check")}</div>
                  <strong>${escapeHtml(step.title)}</strong>
                  <p>${escapeHtml(step.text)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "drilling") {
      return `
        <div class="learning-visual drilling-timeline">
          ${(visual.steps || [])
            .map(
              (step, index) => `
                <article>
                  <span class="drill-index">${index + 1}</span>
                  <div class="visual-icon">${renderIcon(step.icon || "check")}</div>
                  <strong>${escapeHtml(step.title)}</strong>
                  <p>${escapeHtml(step.text)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "forbidden") {
      return `
        <div class="learning-visual forbidden-grid">
          ${(visual.cards || [])
            .map((item) => {
              const value = typeof item === "string" ? { title: item, icon: "stop" } : item;
              return `
                <article>
                  <span>${renderIcon(value.icon || "stop")}</span>
                  <strong>${escapeHtml(value.title)}</strong>
                  ${value.text ? `<p>${escapeHtml(value.text)}</p>` : ""}
                </article>
              `;
            })
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "scenarios") {
      return `
        <div class="learning-visual scenario-grid">
          ${(visual.scenarios || [])
            .map(
              (scenario) => `
                <article>
                  <span class="visual-icon">${renderIcon(scenario.icon || "alert")}</span>
                  <strong>${escapeHtml(scenario.title)}</strong>
                  <p>${escapeHtml(scenario.action)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "algorithm") {
      const layoutClass = visual.layout === "vertical" ? "vertical" : "";
      return `
        <div class="learning-visual algorithm-steps timeline-visual ${layoutClass}">
          ${(visual.steps || [])
            .map(
              (step, index) => {
                const value = typeof step === "string" ? { title: step, icon: "check" } : step;
                return `
                <article>
                  <span>${index + 1}</span>
                  <div class="visual-icon">${renderIcon(value.icon || "check")}</div>
                  <strong>${escapeHtml(value.title)}</strong>
                  ${value.text ? `<p>${escapeHtml(value.text)}</p>` : ""}
                </article>
              `;
              }
            )
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "finish") {
      return `
        <div class="learning-visual finish-grid">
          ${(visual.items || [])
            .map((item, index) => {
              const value = typeof item === "string" ? { title: item, icon: "check" } : item;
              const checkKey = `${block.id}:${index}`;
              return `
                <button class="${state.checklistTicks[checkKey] ? "checked" : ""}" type="button" data-action="toggle-check" data-check="${escapeHtml(checkKey)}">
                  <span>${renderIcon(value.icon || "check")}</span>
                  <strong>${escapeHtml(value.title)}</strong>
                </button>
              `;
            })
            .join("")}
        </div>
      `;
    }

    return `<div class="learning-visual"></div>`;
  }

  function renderMiniQuestion(block) {
    const mini = block.miniQuestion;
    if (!mini) {
      return "";
    }

    const miniAnswer = state.miniAnswers[block.id];
    return `
      <form class="mini-question" id="miniQuestion">
        <div class="mini-question-head">
          <span>${renderIcon("quiz")}</span>
          <div>
            <small>Мини-вопрос</small>
            <strong>${escapeHtml(mini.question)}</strong>
          </div>
        </div>
        <div class="option-list">
          ${mini.options
            .map(
              (option, index) => `
                <label class="${miniAnswer === index ? "selected" : ""} ${miniAnswer !== undefined && index === mini.answer ? "right" : ""} ${
                miniAnswer === index && index !== mini.answer ? "wrong" : ""
              }">
                  <input type="radio" name="mini" value="${index}" ${miniAnswer === index ? "checked" : ""}>
                  <span>${escapeHtml(option)}</span>
                </label>
              `
            )
            .join("")}
        </div>
        <div class="mini-actions">
          <button class="btn secondary" type="button" data-action="answer-mini">Ответить</button>
          ${miniAnswer !== undefined ? `<p class="feedback">${escapeHtml(mini.feedback)}</p>` : ""}
        </div>
      </form>
    `;
  }

  function renderLearning() {
    if (!state.videoSeen) {
      setView("video");
      return;
    }

    const current = selectedModule();
    const blocks = current.learningBlocks;
    const block = blocks[state.learningIndex] || blocks[0];
    state.visitedLearning.add(state.learningIndex);

    const progress = Math.round(((state.learningIndex + 1) / blocks.length) * 100);
    const allViewed = state.visitedLearning.size === blocks.length;
    const badge = learningBadge(block);

    app.innerHTML = `
      ${renderSteps("learning")}
      <section class="learning-screen" style="--learning-progress:${progress}%">
        <div class="learning-header">
          <div>
            <div class="learning-title-row">
              <p class="eyebrow">Интерактивное обучение</p>
              <span class="badge ${badge.className}">${badge.label}</span>
            </div>
            <h2>${escapeHtml(block.title)}</h2>
            <p class="key-thought">${escapeHtml(block.lead)}</p>
          </div>
          <div class="risk-meter ${badgeClassForRisk(block.riskClass)}">
            <span>Уровень риска</span>
            <strong>${escapeHtml(block.riskLevel)}</strong>
          </div>
        </div>

        ${renderBreadcrumbs()}
        ${learningMetaCards(block)}

        <div class="progress-block">
          <div class="progress-meta">
            <span>Блок ${state.learningIndex + 1} из ${blocks.length}</span>
            <span>${progress}% прохождения</span>
          </div>
          <div class="progress-bar"><span style="width:${progress}%"></span></div>
        </div>

        <div class="learning-mini-stepper" aria-label="Прогресс обучающих модулей">
          ${blocks
            .map(
              (item, index) => `
                <span class="${index === state.learningIndex ? "active" : state.visitedLearning.has(index) ? "seen" : ""}" title="${escapeHtml(item.title)}"></span>
              `
            )
            .join("")}
        </div>

        <article class="learning-card">
          ${renderBlockVisual(block)}
          <div class="learning-points">
            <h3>Запомнить</h3>
            ${renderLearningPoints(block)}
          </div>
        </article>

        ${renderLearningInteraction(block)}
        ${renderMiniQuestion(block)}

        <div class="slide-controls no-print">
          <button class="btn ghost" type="button" data-action="learning-prev" ${state.learningIndex === 0 ? "disabled" : ""}>Назад</button>
          ${
            state.learningIndex < blocks.length - 1
              ? '<button class="btn primary" type="button" data-action="learning-next">Далее</button>'
              : `<button class="btn primary" type="button" data-action="to-test" ${allViewed ? "" : "disabled"}>Перейти к тесту</button>`
          }
        </div>
      </section>
    `;
  }

  function renderTest() {
    const current = selectedModule();
    if (state.visitedLearning.size < current.learningBlocks.length) {
      state.learningIndex = Math.min(state.learningIndex, current.learningBlocks.length - 1);
      setView("learning");
      return;
    }

    app.innerHTML = `
      ${renderSteps("test")}
      <section class="test-screen">
        <div class="screen-heading">
          <p class="eyebrow">Итоговый тест</p>
          <h2>10 вопросов · проходной балл ${current.passScore}%</h2>
          <p>Выберите один правильный вариант в каждом вопросе. После отправки появятся пояснения.</p>
        </div>

        ${renderBreadcrumbs()}

        <form id="testForm" class="test-form">
          ${current.test
            .map(
              (question, qIndex) => `
                <fieldset class="question-card">
                  <legend>${qIndex + 1}. ${escapeHtml(question.question)}</legend>
                  <div class="option-list">
                    ${question.options
                      .map(
                        (option, optionIndex) => `
                          <label>
                            <input type="radio" name="q${qIndex}" value="${optionIndex}" ${
                          state.testAnswers[qIndex] === optionIndex ? "checked" : ""
                        }>
                            <span>${escapeHtml(option)}</span>
                          </label>
                        `
                      )
                      .join("")}
                  </div>
                </fieldset>
              `
            )
            .join("")}
          <div class="form-actions sticky-actions">
            <button class="btn ghost" type="button" data-action="go" data-view="learning">Вернуться к обучению</button>
            <button class="btn primary" type="submit">Завершить тест</button>
          </div>
        </form>
      </section>
    `;

    document.getElementById("testForm").addEventListener("submit", handleTestSubmit);
  }

  function handleTestSubmit(event) {
    event.preventDefault();
    const current = selectedModule();
    const formData = new FormData(event.currentTarget);
    const answers = [];

    for (let index = 0; index < current.test.length; index += 1) {
      const value = formData.get(`q${index}`);
      if (value === null) {
        showToast(`Ответьте на вопрос ${index + 1}`);
        return;
      }
      answers.push(Number(value));
    }

    state.testAnswers = Object.fromEntries(answers.map((answer, index) => [index, answer]));
    const score = answers.reduce((sum, answer, index) => sum + (answer === current.test[index].answer ? 1 : 0), 0);
    const total = current.test.length;
    const percent = Math.round((score / total) * 100);
    const passed = percent >= current.passScore;
    const equipment = selectedEquipment();
    const result = {
      id: `result-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      demo: false,
      date: new Date().toISOString(),
      employeeName: state.employee.name,
      tabNumber: state.employee.tabNumber,
      position: state.employee.position,
      email: state.employee.email,
      organization: selectedOrganization().name,
      department: selectedUnit().name,
      equipment: equipment.name,
      installation: equipment.name,
      instruction: equipment.instruction,
      instructionTitle: equipment.instructionTitle,
      moduleId: current.id,
      score,
      total,
      percent,
      passed,
      certificateId: passed ? window.SafetyCertificate.generateCertificateId(current.id) : "",
      answers
    };

    if (passed) {
      saveResult(result);
    }

    state.result = result;
    setView("test-result");
  }

  function renderTestResult() {
    const current = selectedModule();
    const result = state.result;
    if (!result) {
      setView("test");
      return;
    }

    app.innerHTML = `
      ${renderSteps(result.passed ? "certificate" : "test")}
      <section class="result-screen">
        <div class="result-banner ${result.passed ? "passed" : "failed"}">
          <span>${result.passed ? "Зачтено" : "Не зачтено"}</span>
          <h2>${result.score}/${result.total} · ${result.percent}%</h2>
          <p>${
            result.passed
              ? "Результат сохранен. Сертификат готов к печати, уведомление по ОТ можно отправить письмом."
              : "Проходной балл не набран. Результат не сохранен в журнале."
          }</p>
        </div>

        <div class="explanation-list">
          ${current.test
            .map((question, index) => {
              const answer = result.answers[index];
              const ok = answer === question.answer;
              return `
                <article class="explanation ${ok ? "right" : "wrong"}">
                  <div>
                    <strong>${index + 1}. ${escapeHtml(question.question)}</strong>
                    <p>Ваш ответ: ${escapeHtml(question.options[answer] || "—")}</p>
                    <p>Верно: ${escapeHtml(question.options[question.answer])}</p>
                  </div>
                  <span>${escapeHtml(question.explanation)}</span>
                </article>
              `;
            })
            .join("")}
        </div>

        <div class="action-strip no-print">
          ${
            result.passed
              ? `<button class="btn primary" type="button" data-action="open-certificate">Открыть сертификат</button>
                 <button class="btn secondary" type="button" data-action="send-ot-confirm">Уведомить ОТ</button>`
              : '<button class="btn primary" type="button" data-action="retry-test">Повторить тест</button>'
          }
          <button class="btn ghost" type="button" data-action="go" data-view="learning">Вернуться к обучению</button>
        </div>
      </section>
    `;
  }

  function renderCertificate() {
    const result = state.result;
    if (!result || !result.passed) {
      setView("home");
      return;
    }

    app.innerHTML = `
      ${renderSteps("certificate")}
      <section class="certificate-screen">
        <div class="certificate-toolbar no-print">
          <div>
            <p class="eyebrow">Сертификат</p>
            <h2>${escapeHtml(result.employeeName)}</h2>
          </div>
          <div class="toolbar-actions">
            <button class="btn primary" type="button" data-action="download-pdf">Скачать PDF</button>
            <button class="btn secondary" type="button" data-action="share-certificate">Поделиться</button>
            <button class="btn secondary" type="button" data-action="send-ot-confirm">Уведомить ОТ</button>
            <button class="btn ghost" type="button" data-action="go" data-view="home">На главную</button>
          </div>
        </div>
        ${window.SafetyCertificate.buildCertificateHTML(result)}
      </section>
    `;
  }

  function getFilteredResults() {
    const search = state.journalFilters.search.toLowerCase().trim();
    return loadResults().filter((item) => {
      const employeeName = String(item.employeeName || "").toLowerCase();
      const byName = !search || employeeName.includes(search);
      const byOrg = !state.journalFilters.organization || item.organization === state.journalFilters.organization;
      const byEquipment = !state.journalFilters.equipment || item.equipment === state.journalFilters.equipment;
      return byName && byOrg && byEquipment;
    });
  }

  function renderAdmin() {
    ensureDemoResults();
    const results = loadResults();
    const { organization, unit, equipment } = findReadyPath();
    const orgOptions = [...new Set(results.map((item) => item.organization).filter(Boolean))]
      .map((org) => `<option value="${escapeHtml(org)}" ${org === state.journalFilters.organization ? "selected" : ""}>${escapeHtml(org)}</option>`)
      .join("");
    const equipmentOptions = [...new Set(results.map((item) => item.equipment).filter(Boolean))]
      .map(
        (item) => `<option value="${escapeHtml(item)}" ${item === state.journalFilters.equipment ? "selected" : ""}>${escapeHtml(item)}</option>`
      )
      .join("");

    app.innerHTML = `
      <section class="admin-screen">
        <div class="screen-heading admin-heading">
          <div>
            <p class="eyebrow">Администратор</p>
            <h2>Журнал и справочник модулей</h2>
            <p>Служебный раздел для просмотра результатов и структуры каталога.</p>
          </div>
          <button class="btn ghost" type="button" data-action="go" data-view="home">На главный экран</button>
        </div>

        <div class="journal-tools no-print">
          <label>
            <span>Поиск по ФИО</span>
            <input id="journalSearch" value="${escapeHtml(state.journalFilters.search)}" placeholder="Введите фамилию">
          </label>
          <label>
            <span>Организация</span>
            <select id="journalOrganization">
              <option value="">Все</option>
              ${orgOptions}
            </select>
          </label>
          <label>
            <span>Оборудование</span>
            <select id="journalEquipment">
              <option value="">Все</option>
              ${equipmentOptions}
            </select>
          </label>
          <button class="btn secondary" type="button" data-action="export-csv">Экспорт CSV</button>
          <button class="btn danger" type="button" data-action="clear-demo">Очистить демо-данные</button>
        </div>

        <div class="table-wrap">
          <table class="journal-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>ФИО</th>
                <th>Таб. номер</th>
                <th>Должность</th>
                <th>Организация</th>
                <th>Подразделение</th>
                <th>Установка</th>
                <th>Инструкция</th>
                <th>Результат</th>
                <th>ID сертификата</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="journalRows"></tbody>
          </table>
        </div>

        <section class="admin-reference">
          <article class="module-card">
            <div class="module-card-head">
              <span class="badge badge-mandatory">${escapeHtml(equipment.instruction)}</span>
              <span>${defaultModule.passScore}%</span>
            </div>
            <h3>${escapeHtml(defaultModule.title)}</h3>
            <dl>
              <div><dt>Организация</dt><dd>${escapeHtml(organization.name)}</dd></div>
              <div><dt>Подразделение</dt><dd>${escapeHtml(unit.name)}</dd></div>
              <div><dt>Разработчик</dt><dd>${escapeHtml(equipment.developer)}</dd></div>
              <div><dt>Ответственная по ОТ</dt><dd>${escapeHtml(equipment.safetyResponsible)}</dd></div>
            </dl>
          </article>

          <article class="module-outline">
            <h3>Каталог подразделений</h3>
            <ol>
              ${data.trainingCatalog
                .flatMap((org) => org.children.map((child) => `${org.name}: ${child.name}`))
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ol>
          </article>

          <article class="module-outline">
            <h3>Блоки обучения</h3>
            <ol>
              ${defaultModule.learningBlocks.map((block) => `<li>${escapeHtml(block.title)}</li>`).join("")}
            </ol>
          </article>
        </section>
      </section>
    `;

    renderJournalRows();
    document.getElementById("journalSearch").addEventListener("input", (event) => {
      state.journalFilters.search = event.target.value;
      renderJournalRows();
    });
    document.getElementById("journalOrganization").addEventListener("change", (event) => {
      state.journalFilters.organization = event.target.value;
      renderJournalRows();
    });
    document.getElementById("journalEquipment").addEventListener("change", (event) => {
      state.journalFilters.equipment = event.target.value;
      renderJournalRows();
    });
  }

  function renderJournalRows() {
    const rows = getFilteredResults();
    const body = document.getElementById("journalRows");
    if (!body) {
      return;
    }
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="11" class="empty-cell">Записей не найдено</td></tr>`;
      return;
    }

    body.innerHTML = rows
      .map(
        (item) => `
          <tr>
            <td>${window.SafetyCertificate.formatDate(item.date)}</td>
            <td>${escapeHtml(item.employeeName)}${item.demo ? '<span class="demo-label">демо</span>' : ""}</td>
            <td>${escapeHtml(item.tabNumber || "—")}</td>
            <td>${escapeHtml(item.position || "—")}</td>
            <td>${escapeHtml(item.organization || "—")}</td>
            <td>${escapeHtml(item.department || "—")}</td>
            <td>${escapeHtml(item.installation || item.equipment || "—")}</td>
            <td>${escapeHtml(item.instruction || "—")}</td>
            <td><span class="status ${item.passed ? "passed" : "failed"}">${item.score}/${item.total} (${item.percent}%)</span></td>
            <td>${escapeHtml(item.certificateId || "—")}</td>
            <td>
              ${
                item.passed
                  ? `<button class="table-action" type="button" data-action="view-certificate" data-id="${escapeHtml(item.id)}">Просмотр</button>`
                  : '<span class="muted">—</span>'
              }
            </td>
          </tr>
        `
      )
      .join("");
  }

  function showToast(message) {
    const previous = document.querySelector(".toast");
    if (previous) {
      previous.remove();
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 2600);
  }

  function clearDemoResults() {
    const realResults = loadResults().filter((item) => !item.demo);
    storeResults(realResults);
    renderAdmin();
    showToast("Демо-данные очищены");
  }

  function findResult(id) {
    return loadResults().find((item) => item.id === id);
  }

  function currentLearningBlock() {
    return selectedModule().learningBlocks[state.learningIndex];
  }

  function handleAction(event) {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const action = target.dataset.action;
    event.preventDefault();

    if (action === "go") {
      setView(target.dataset.view);
      return;
    }

    if (action === "select-organization") {
      state.selection.organizationId = target.dataset.id;
      state.selection.unitId = selectedOrganization().children[0].id;
      syncUnitSelection();
      renderUnitSelection();
      return;
    }

    if (action === "select-unit") {
      state.selection.unitId = target.dataset.id;
      syncUnitSelection();
      renderUnitSelection();
      return;
    }

    if (action === "continue-unit") {
      setView("equipment");
      return;
    }

    if (action === "select-equipment") {
      state.selection.equipmentId = target.dataset.id;
      renderEquipmentSelection();
      return;
    }

    if (action === "select-tab") {
      state.activeTabs[target.dataset.block] = Number(target.dataset.tab);
      renderLearning();
      return;
    }

    if (action === "select-hotspot") {
      const block = currentLearningBlock();
      state.activeHotspots[block.id] = Number(target.dataset.index);
      renderLearning();
      return;
    }

    if (action === "toggle-card") {
      const key = target.dataset.card;
      state.expandedCards[key] = !state.expandedCards[key];
      renderLearning();
      return;
    }

    if (action === "toggle-check") {
      const key = target.dataset.check;
      state.checklistTicks[key] = !state.checklistTicks[key];
      renderLearning();
      return;
    }

    if (action === "begin-training") {
      if (!isReadyEquipment(selectedEquipment())) {
        showToast("Для выбранной установки модуль еще в разработке");
        return;
      }
      resetLearningProgress();
      setView("video");
      return;
    }

    if (action === "mark-video") {
      state.videoSeen = true;
      state.learningIndex = 0;
      setView("learning");
      return;
    }

    if (action === "learning-prev") {
      state.learningIndex = Math.max(0, state.learningIndex - 1);
      renderLearning();
      return;
    }

    if (action === "learning-next") {
      const block = currentLearningBlock();
      if (block.miniQuestion && state.miniAnswers[block.id] === undefined) {
        showToast("Ответьте на мини-вопрос, чтобы продолжить");
        return;
      }
      state.learningIndex = Math.min(selectedModule().learningBlocks.length - 1, state.learningIndex + 1);
      renderLearning();
      return;
    }

    if (action === "answer-mini") {
      const checked = document.querySelector('input[name="mini"]:checked');
      if (!checked) {
        showToast("Выберите вариант ответа");
        return;
      }
      const block = currentLearningBlock();
      state.miniAnswers[block.id] = Number(checked.value);
      renderLearning();
      return;
    }

    if (action === "to-test") {
      const block = currentLearningBlock();
      if (block.miniQuestion && state.miniAnswers[block.id] === undefined) {
        showToast("Ответьте на мини-вопрос перед тестом");
        return;
      }
      if (state.visitedLearning.size < selectedModule().learningBlocks.length) {
        showToast("Просмотрите все обучающие блоки перед тестом");
        return;
      }
      setView("test");
      return;
    }

    if (action === "retry-test") {
      state.testAnswers = {};
      setView("test");
      return;
    }

    if (action === "open-certificate") {
      setView("certificate");
      return;
    }

    if (action === "print-certificate") {
      window.SafetyCertificate.printCertificate();
      return;
    }

    if (action === "download-pdf") {
      window.SafetyCertificate.printCertificate();
      return;
    }

    if (action === "send-ot-confirm") {
      if (!state.result) {
        showToast("Сначала сформируйте результат обучения");
        return;
      }
      const ok = window.confirm("Открыть письмо для отправки уведомления по охране труда?");
      if (ok) {
        window.location.href = window.SafetyExport.buildMailto(state.result);
      }
      return;
    }

    if (action === "share-certificate") {
      if (!state.result) {
        showToast("Сертификат пока не сформирован");
        return;
      }
      const shareUrl = window.location.href.split("#")[0];
      const shareText = `Сертификат ${state.result.certificateId}: ${state.result.employeeName}, ${state.result.percent}%`;
      if (navigator.share) {
        navigator.share({
          title: "Сертификат OT-JULE",
          text: shareText,
          url: shareUrl
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => showToast("Ссылка на сертификат скопирована"));
      } else {
        showToast(shareText);
      }
      return;
    }

    if (action === "export-csv") {
      window.SafetyExport.exportJournalCSV(getFilteredResults());
      return;
    }

    if (action === "clear-demo") {
      clearDemoResults();
      return;
    }

    if (action === "view-certificate") {
      const result = findResult(target.dataset.id);
      if (!result || !result.passed) {
        showToast("Сертификат для этой записи недоступен");
        return;
      }
      state.result = result;
      setView("certificate");
    }
  }

  function render() {
    document.body.dataset.view = state.view;
    const views = {
      home: renderHome,
      identity: renderIdentity,
      unit: renderUnitSelection,
      equipment: renderEquipmentSelection,
      "equipment-card": renderEquipmentSelection,
      video: renderVideo,
      learning: renderLearning,
      test: renderTest,
      "test-result": renderTestResult,
      certificate: renderCertificate,
      admin: renderAdmin,
      journal: renderAdmin,
      reference: renderAdmin
    };
    (views[state.view] || renderHome)();
  }

  document.addEventListener("click", handleAction);
  render();
})();
