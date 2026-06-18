(function () {
  const app = document.getElementById("app");
  const data = window.SafetyData;
  const defaultModule = data.modules[0];
  const firstOrganization = data.organizationTree[0];
  const firstDepartment = firstOrganization.departments[0];
  const firstLab = firstDepartment.labs[0];
  const firstSector = firstLab.sectors[0];
  const firstEquipmentId = firstSector.equipmentIds[0];
  const STORAGE_KEY = "safetyTrainingResultsV2";
  const DEMO_KEY = "safetyTrainingDemoSeededV2";

  const state = {
    view: "home",
    selection: {
      organizationId: firstOrganization.id,
      departmentId: firstDepartment.id,
      labId: firstLab.id,
      sectorId: firstSector.id,
      equipmentId: firstEquipmentId
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
    return byId(data.organizationTree, state.selection.organizationId) || data.organizationTree[0];
  }

  function selectedDepartment() {
    const organization = selectedOrganization();
    return byId(organization.departments, state.selection.departmentId) || organization.departments[0];
  }

  function selectedLab() {
    const department = selectedDepartment();
    return byId(department.labs, state.selection.labId) || department.labs[0];
  }

  function selectedSector() {
    const lab = selectedLab();
    return byId(lab.sectors, state.selection.sectorId) || lab.sectors[0];
  }

  function selectedEquipment() {
    const sector = selectedSector();
    const equipmentId = state.selection.equipmentId || sector.equipmentIds[0];
    return byId(data.equipment, equipmentId) || data.equipment[0];
  }

  function selectedModule() {
    const equipment = selectedEquipment();
    return data.modules.find((item) => item.equipmentId === equipment.id) || defaultModule;
  }

  function fullSubdivision(separator = " / ") {
    return [selectedDepartment().name, selectedLab().name, selectedSector().name].join(separator);
  }

  function setView(view) {
    state.view = view;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function optionList(items, selectedId) {
    return items
      .map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === selectedId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
      .join("");
  }

  function syncCascade(changedLevel) {
    const organization = selectedOrganization();

    if (changedLevel === "organization" || !organization.departments.some((item) => item.id === state.selection.departmentId)) {
      state.selection.departmentId = organization.departments[0].id;
      changedLevel = "department";
    }

    const department = selectedDepartment();
    if (changedLevel === "department" || !department.labs.some((item) => item.id === state.selection.labId)) {
      state.selection.labId = department.labs[0].id;
      changedLevel = "lab";
    }

    const lab = selectedLab();
    if (changedLevel === "lab" || !lab.sectors.some((item) => item.id === state.selection.sectorId)) {
      state.selection.sectorId = lab.sectors[0].id;
      changedLevel = "sector";
    }

    const sector = selectedSector();
    if (changedLevel === "sector" || !sector.equipmentIds.includes(state.selection.equipmentId)) {
      state.selection.equipmentId = sector.equipmentIds[0];
    }
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

    const equipment = data.equipment[0];
    const organization = data.organizationTree[0];
    const department = organization.departments[0];
    const lab = department.labs[0];
    const sector = lab.sectors[0];
    const subdivision = [department.name, lab.name, sector.name].join(" / ");
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
        department: subdivision,
        equipment: equipment.name,
        installation: equipment.name,
        instruction: equipment.instructionCode,
        moduleId: defaultModule.id,
        score: 9,
        total: 10,
        percent: 90,
        passed: true,
        certificateId: "IOT47-DEMO-0001",
        answers: []
      },
      {
        id: "demo-2",
        demo: true,
        date: new Date(now - 172800000).toISOString(),
        employeeName: "Петрова Анна Викторовна",
        tabNumber: "0227",
        position: "младший научный сотрудник",
        email: "petrova@example.com",
        organization: organization.name,
        department: subdivision,
        equipment: equipment.name,
        installation: equipment.name,
        instruction: equipment.instructionCode,
        moduleId: defaultModule.id,
        score: 10,
        total: 10,
        percent: 100,
        passed: true,
        certificateId: "IOT47-DEMO-0002",
        answers: []
      }
    ];

    storeResults([...demo, ...loadResults()]);
    localStorage.setItem(DEMO_KEY, "1");
  }

  function button(label, view, variant = "primary") {
    return `<button class="btn ${variant}" type="button" data-action="go" data-view="${view}">${escapeHtml(label)}</button>`;
  }

  function renderSteps(active) {
    const steps = [
      ["identity", "Данные"],
      ["unit", "Подразделение"],
      ["equipment-card", "Установка"],
      ["video", "Видео"],
      ["learning", "Обучение"],
      ["test", "Тест"],
      ["certificate", "Сертификат"]
    ];
    const order = steps.map((item) => item[0]);
    const activeIndex = order.indexOf(active);

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
      <section class="hero employee-home">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="hero-content">
          <p class="eyebrow">АО «РусНИТИ» · цифровой инструктаж</p>
          <h1>${escapeHtml(data.project.title)}</h1>
          <p>${escapeHtml(data.project.subtitle)}</p>
          <div class="hero-actions single-action">
            ${button("Пройти обучение", "identity")}
          </div>
        </div>
      </section>

      <section class="overview-grid compact-overview" aria-label="Краткая информация о доступном модуле">
        <article class="metric-tile">
          <span>Доступный модуль</span>
          <strong>ИОТ-47</strong>
          <p>Вертикально-сверлильный станок Hitachi B16RM</p>
        </article>
        <article class="metric-tile">
          <span>Сценарий</span>
          <strong>Видео · тренажер · тест</strong>
          <p>Результат фиксируется в локальном журнале после успешного прохождения.</p>
        </article>
        <article class="metric-tile">
          <span>Проходной балл</span>
          <strong>${defaultModule.passScore}%</strong>
          <p>Сертификат формируется при результате 8 из 10 и выше.</p>
        </article>
      </section>

      <div class="home-admin-footer no-print">
        <button class="admin-link" type="button" data-action="go" data-view="admin">Администратор</button>
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
          <p>Данные попадут в сертификат и уведомление по охране труда.</p>
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
            <button class="btn primary" type="submit">Далее</button>
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
    syncCascade();
    const organization = selectedOrganization();
    const department = selectedDepartment();
    const lab = selectedLab();
    const sector = selectedSector();
    const equipmentItems = sector.equipmentIds.map((id) => byId(data.equipment, id)).filter(Boolean);

    app.innerHTML = `
      ${renderSteps("unit")}
      <section class="screen-grid">
        <div class="screen-heading">
          <p class="eyebrow">Шаг 2</p>
          <h2>Выбор подразделения и установки</h2>
          <p>Маршрут обучения собирается каскадом: от организации до конкретного оборудования.</p>
        </div>

        <form class="form-panel cascade-panel" id="unitForm">
          <div class="cascade-grid">
            <label>
              <span>Организация</span>
              <select name="organizationId">${optionList(data.organizationTree, state.selection.organizationId)}</select>
            </label>
            <label>
              <span>Отдел</span>
              <select name="departmentId">${optionList(organization.departments, state.selection.departmentId)}</select>
            </label>
            <label>
              <span>Лаборатория</span>
              <select name="labId">${optionList(department.labs, state.selection.labId)}</select>
            </label>
            <label>
              <span>Сектор / участок</span>
              <select name="sectorId">${optionList(lab.sectors, state.selection.sectorId)}</select>
            </label>
            <label class="cascade-wide">
              <span>Установка / оборудование</span>
              <select name="equipmentId">${optionList(equipmentItems, state.selection.equipmentId)}</select>
            </label>
          </div>

          <aside class="selection-summary">
            <span>Выбрано</span>
            <strong>${escapeHtml(selectedEquipment().name)}</strong>
            <p>${escapeHtml(fullSubdivision(" · "))}</p>
          </aside>

          <div class="form-actions">
            <button class="btn ghost" type="button" data-action="go" data-view="identity">Назад</button>
            <button class="btn primary" type="submit">Показать карточку оборудования</button>
          </div>
        </form>
      </section>
    `;

    const form = document.getElementById("unitForm");
    form.addEventListener("change", (event) => {
      const target = event.target;
      state.selection[target.name] = target.value;
      const level = {
        organizationId: "organization",
        departmentId: "department",
        labId: "lab",
        sectorId: "sector",
        equipmentId: "equipment"
      }[target.name];
      syncCascade(level);
      renderUnitSelection();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      setView("equipment-card");
    });
  }

  function renderEquipmentCard() {
    const equipment = selectedEquipment();
    const current = selectedModule();

    app.innerHTML = `
      ${renderSteps("equipment-card")}
      <section class="equipment-card-screen">
        <div class="screen-heading">
          <p class="eyebrow">Шаг 3</p>
          <h2>Карточка оборудования</h2>
          <p>Проверьте, что выбрана правильная установка и инструкция.</p>
        </div>

        <article class="equipment-hero-card">
          <div class="equipment-hero-main">
            <span class="badge badge-mandatory">${escapeHtml(equipment.instructionCode)}</span>
            <h3>${escapeHtml(equipment.name)}</h3>
            <p>${escapeHtml(equipment.instructionTitle)}</p>
            <dl class="equipment-details">
              <div><dt>Организация</dt><dd>${escapeHtml(selectedOrganization().name)}</dd></div>
              <div><dt>Подразделение</dt><dd>${escapeHtml(fullSubdivision())}</dd></div>
              <div><dt>Разработчик</dt><dd>${escapeHtml(equipment.developer)}</dd></div>
              <div><dt>Ответственная по ОТ</dt><dd>${escapeHtml(equipment.safetyResponsible)}</dd></div>
              <div><dt>Формат</dt><dd>видео, ${current.learningBlocks.length} интерактивных блоков, тест из ${current.test.length} вопросов</dd></div>
            </dl>
          </div>

          <div class="equipment-risk-panel">
            <span>Основные риски</span>
            <div class="risk-chip-grid">
              ${equipment.risks.map((risk) => `<b>${escapeHtml(risk)}</b>`).join("")}
            </div>
          </div>
        </article>

        <div class="action-strip no-print">
          <button class="btn ghost" type="button" data-action="go" data-view="unit">Назад</button>
          <button class="btn primary" type="button" data-action="begin-training">Начать обучение</button>
        </div>
      </section>
    `;
  }

  function renderVideo() {
    const equipment = selectedEquipment();
    const videoPath = equipment.videoPath;
    app.innerHTML = `
      ${renderSteps("video")}
      <section class="learning-layout">
        <div class="screen-heading">
          <p class="eyebrow">Видеообучение</p>
          <h2>${escapeHtml(equipment.name)}</h2>
          <p>${escapeHtml(equipment.instructionCode)} · после видео откроется интерактивный тренажер по безопасной работе.</p>
        </div>

        <div class="video-shell">
          <video id="trainingVideo" class="${state.videoMissing ? "is-hidden" : ""}" controls playsinline preload="metadata" poster="assets/img/industrial-safety-panel.png">
            <source src="${escapeHtml(videoPath)}" type="video/mp4">
          </video>
          <div id="videoFallback" class="video-fallback ${state.videoMissing ? "" : "is-hidden"}">
            <span class="fallback-mark"></span>
            <h3>Видео будет подключено позже</h3>
            <p>Файл ${escapeHtml(videoPath)} не найден или еще не добавлен. Для демонстрации можно отметить видео как просмотренное и перейти к интерактивному обучению.</p>
          </div>
        </div>

        <div class="action-strip">
          <button class="btn ghost" type="button" data-action="go" data-view="equipment-card">Назад</button>
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

    if (block.visualType === "workplace") {
      return `
        <div class="learning-visual workzone-grid">
          ${(visual.zones || [])
            .map(
              (zone) => `
                <article>
                  <span>${escapeHtml(zone.title)}</span>
                  <strong>${escapeHtml(zone.state)}</strong>
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

    if (block.visualType === "process") {
      return `
        <div class="learning-visual process-rail">
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

    if (block.visualType === "memo") {
      return `
        <div class="learning-visual memo-grid">
          ${(visual.cards || [])
            .map(
              (card) => `
                <article>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                </article>
              `
            )
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
    const riskClass = badgeClassForRisk(block.riskClass);

    app.innerHTML = `
      ${renderSteps("learning")}
      <section class="learning-screen">
        <div class="learning-header">
          <div>
            <p class="eyebrow">Интерактивное обучение</p>
            <h2>${escapeHtml(block.title)}</h2>
            <p>${escapeHtml(block.lead)}</p>
          </div>
          <div class="risk-meter ${riskClass}">
            <span>Уровень риска</span>
            <strong>${escapeHtml(block.riskLevel)}</strong>
          </div>
        </div>

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
            <h3>Ключевые действия</h3>
            <ul class="safety-list">
              ${block.points.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
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
      department: fullSubdivision(),
      equipment: equipment.name,
      installation: equipment.name,
      instruction: equipment.instructionCode,
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
              ? "Проходной балл набран. Результат сохранен, сертификат готов к печати, уведомление по ОТ можно отправить письмом."
              : "Проходной балл не набран. Результат не сохранен в журнале: повторите материал и пройдите тест снова."
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
    const equipment = selectedEquipment();
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
            <p>Раздел скрыт с главной страницы для сотрудника и предназначен для проверки результатов.</p>
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
              <span class="badge badge-mandatory">${escapeHtml(equipment.instructionCode)}</span>
              <span>${defaultModule.passScore}%</span>
            </div>
            <h3>${escapeHtml(defaultModule.title)}</h3>
            <dl>
              <div><dt>Организация</dt><dd>${escapeHtml(selectedOrganization().name)}</dd></div>
              <div><dt>Подразделение</dt><dd>${escapeHtml(fullSubdivision())}</dd></div>
              <div><dt>Разработчик</dt><dd>${escapeHtml(equipment.developer)}</dd></div>
              <div><dt>Ответственная по ОТ</dt><dd>${escapeHtml(equipment.safetyResponsible)}</dd></div>
            </dl>
          </article>

          <article class="module-outline">
            <h3>Интерактивные блоки</h3>
            <ol>
              ${defaultModule.learningBlocks.map((block) => `<li>${escapeHtml(block.title)}</li>`).join("")}
            </ol>
          </article>

          <article class="module-outline">
            <h3>Этапы проекта</h3>
            <ol>
              ${data.project.timeline.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
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

    if (action === "begin-training") {
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
    const views = {
      home: renderHome,
      identity: renderIdentity,
      unit: renderUnitSelection,
      "equipment-card": renderEquipmentCard,
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
