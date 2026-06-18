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
    learningIndex: 0,
    visitedLearning: new Set(),
    miniAnswers: {},
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
      ["identity", "Данные сотрудника"],
      ["unit", "Подразделение"],
      ["equipment", "Установка"],
      ["learning", "Обучение"],
      ["test", "Тест"],
      ["certificate", "Сертификат"]
    ];
    const activeIndex = steps.findIndex(([id]) => id === active);

    return `
      <ol class="stepper compact no-print" aria-label="Этапы обучения">
        ${steps
          .map(([id, label], index) => {
            const status = index < activeIndex ? "done" : index === activeIndex ? "active" : "";
            return `<li class="${status}"><span>${index + 1}</span>${escapeHtml(label)}</li>`;
          })
          .join("")}
      </ol>
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

  function resetLearningProgress() {
    state.videoSeen = false;
    state.videoMissing = false;
    state.learningIndex = 0;
    state.visitedLearning = new Set();
    state.miniAnswers = {};
    state.testAnswers = {};
    state.result = null;
  }

  function renderHome() {
    app.innerHTML = `
      <section class="hero employee-home minimal-home">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="hero-content">
          <h1>${escapeHtml(data.project.title)}</h1>
          <p>${escapeHtml(data.project.subtitle)}</p>
          <div class="hero-actions single-action">
            <button class="btn primary" type="button" data-action="go" data-view="identity">Пройти обучение</button>
          </div>
        </div>
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

        <form class="form-panel identity-panel" id="identityForm">
          <div class="form-row">
            <label>
              <span>ФИО</span>
              <input name="employeeName" value="${escapeHtml(state.employee.name)}" autocomplete="name" required placeholder="Фамилия Имя Отчество">
            </label>
            <label>
              <span>Табельный номер</span>
              <input name="tabNumber" value="${escapeHtml(state.employee.tabNumber)}" required placeholder="0000">
            </label>
          </div>
          <div class="form-row">
            <label>
              <span>Должность</span>
              <input name="position" value="${escapeHtml(state.employee.position)}" required placeholder="инженер-испытатель">
            </label>
            <label>
              <span>E-mail, если есть</span>
              <input name="email" type="email" value="${escapeHtml(state.employee.email)}" placeholder="name@example.com">
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
      const formData = new FormData(event.currentTarget);
      state.employee = {
        name: String(formData.get("employeeName") || "").trim(),
        tabNumber: String(formData.get("tabNumber") || "").trim(),
        position: String(formData.get("position") || "").trim(),
        email: String(formData.get("email") || "").trim()
      };

      if (!state.employee.name || !state.employee.tabNumber || !state.employee.position) {
        showToast("Заполните ФИО, табельный номер и должность");
        return;
      }

      setView("unit");
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
                    <span class="choice-type">Организация</span>
                    <strong>${escapeHtml(item.name)}</strong>
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
                    <span class="choice-type">${escapeHtml(typeLabel(unit.type))}</span>
                    <strong>${escapeHtml(unit.name)}</strong>
                    <small>${hasReady ? "есть готовый модуль" : "модуль в разработке"}</small>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>

        ${renderBreadcrumbs(false)}

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
      ${renderSteps("learning")}
      <section class="learning-layout">
        <div class="screen-heading">
          <p class="eyebrow">Видео</p>
          <h2>${escapeHtml(equipment.name)}</h2>
          <p>${escapeHtml(equipment.instruction)} · после просмотра откроется интерактивное обучение.</p>
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
        </div>

        <div class="action-strip no-print">
          <button class="btn ghost" type="button" data-action="go" data-view="equipment">Назад</button>
          <button class="btn primary" type="button" data-action="mark-video">Видео просмотрено</button>
        </div>
      </section>
    `;

    const video = document.getElementById("trainingVideo");
    const fallback = document.getElementById("videoFallback");
    const showFallback = () => {
      state.videoMissing = true;
      video.classList.add("is-hidden");
      fallback.classList.remove("is-hidden");
    };
    video.addEventListener("error", showFallback);
    video.querySelector("source").addEventListener("error", showFallback);
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

  function renderBlockVisual(block) {
    const visual = block.visual || {};

    if (block.visualType === "hazard-map") {
      return `
        <div class="learning-visual hazard-map-visual">
          <div class="machine-map" aria-label="Схема опасных зон станка">
            <div class="machine-head"></div>
            <div class="machine-spindle"></div>
            <div class="machine-table"></div>
            <div class="machine-base"></div>
            ${(visual.markers || [])
              .map(
                (marker, index) => `
                  <span class="hotspot" style="left:${marker.x}%; top:${marker.y}%;">
                    <i>${index + 1}</i>
                    <b>${escapeHtml(marker.label)}</b>
                  </span>
                `
              )
              .join("")}
          </div>
          <div class="hotspot-list">
            ${(visual.markers || [])
              .map((marker, index) => `<p><strong>${index + 1}. ${escapeHtml(marker.label)}:</strong> ${escapeHtml(marker.note)}</p>`)
              .join("")}
          </div>
        </div>
      `;
    }

    if (block.visualType === "checklist") {
      return `
        <div class="learning-visual checklist-grid">
          ${(visual.items || []).map((item) => `<div class="check-card"><span></span><strong>${escapeHtml(item)}</strong></div>`).join("")}
        </div>
      `;
    }

    if (block.visualType === "ppe") {
      return `
        <div class="learning-visual ppe-grid">
          ${(visual.cards || [])
            .map(
              (card) => `
                <article class="ppe-card">
                  <span>${escapeHtml(card.icon)}</span>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                </article>
              `
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
                  <span class="inspection-dot"></span>
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
            ${(visual.good || []).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
          </article>
          <article class="compare-card bad">
            <span>Неправильно</span>
            ${(visual.bad || []).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
          </article>
        </div>
      `;
    }

    if (block.visualType === "forbidden") {
      return `
        <div class="learning-visual forbidden-grid">
          ${(visual.cards || []).map((item) => `<article><span></span><strong>${escapeHtml(item)}</strong></article>`).join("")}
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
      return `
        <div class="learning-visual algorithm-steps">
          ${(visual.steps || [])
            .map(
              (step, index) => `
                <article>
                  <span>${index + 1}</span>
                  <strong>${escapeHtml(step)}</strong>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (block.visualType === "finish") {
      return `
        <div class="learning-visual finish-grid">
          ${(visual.items || []).map((item) => `<article><span></span><strong>${escapeHtml(item)}</strong></article>`).join("")}
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
        <strong>${escapeHtml(mini.question)}</strong>
        <div class="option-list">
          ${mini.options
            .map(
              (option, index) => `
                <label class="${miniAnswer !== undefined && index === mini.answer ? "right" : ""} ${
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

    app.innerHTML = `
      ${renderSteps("learning")}
      <section class="learning-screen">
        <div class="learning-header">
          <div>
            <p class="eyebrow">Интерактивное обучение</p>
            <h2>${escapeHtml(block.title)}</h2>
            <p>${escapeHtml(block.lead)}</p>
          </div>
          <div class="risk-meter ${badgeClassForRisk(block.riskClass)}">
            <span>Уровень риска</span>
            <strong>${escapeHtml(block.riskLevel)}</strong>
          </div>
        </div>

        ${renderBreadcrumbs()}

        <div class="progress-block">
          <div class="progress-meta">
            <span>Блок ${state.learningIndex + 1} из ${blocks.length}</span>
            <span>${progress}% прохождения</span>
          </div>
          <div class="progress-bar"><span style="width:${progress}%"></span></div>
        </div>

        <article class="learning-card">
          ${renderBlockVisual(block)}
          <div class="learning-points">
            <h3>Запомнить</h3>
            <ul class="safety-list">
              ${block.points.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        </article>

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
                 <a class="btn secondary" href="${window.SafetyExport.buildMailto(result)}">Отправить уведомление по ОТ</a>`
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
      <section class="certificate-screen">
        <div class="certificate-toolbar no-print">
          <div>
            <p class="eyebrow">Сертификат</p>
            <h2>${escapeHtml(result.employeeName)}</h2>
          </div>
          <div class="toolbar-actions">
            <button class="btn primary" type="button" data-action="print-certificate">Скачать / распечатать сертификат</button>
            <a class="btn secondary" href="${window.SafetyExport.buildMailto(result)}">Отправить уведомление по ОТ</a>
            <button class="btn ghost" type="button" data-action="go" data-view="home">На главный экран</button>
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
