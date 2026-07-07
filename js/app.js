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
    departmentLearningIndex: 0,
    visitedDepartmentLearning: new Set(),
    departmentMiniAnswers: {},
    departmentCommonComplete: false,
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

  const LEARNING_BRIEFINGS = {
    "hazard-map": {
      cards: [
        { tone: "risk", label: "Высокий риск", title: "Зона вращения", text: "Патрон, сверло и ключи держим вне контакта с руками, одеждой и СИЗ." },
        { tone: "ppe", label: "СИЗ", title: "Глаза защищены", text: "Очки или лицевой щиток надеваются до подхода к станку." },
        { tone: "forbidden", label: "Запрещено", title: "Руки у патрона", text: "Не тормозить, не направлять и не поправлять детали руками." }
      ],
      summary: ["Опасную зону определяем до запуска.", "Все действия руками выполняем только после полной остановки.", "Электрика и крепление проверяются заранее."],
      miniQuestion: {
        question: "Где нельзя держать руки и предметы?",
        options: ["в зоне патрона, сверла и стружки", "только рядом с кнопкой пуска", "только у стойки станка", "на безопасном расстоянии от вращения"],
        answer: 0,
        feedback: "Руки, одежда, ключи и предметы держат вне зоны патрона, сверла и отлета стружки."
      }
    },
    "admission-checklist": {
      cards: [
        { tone: "required", label: "Обязательно", title: "Допуск подтвержден", text: "Работать можно только после обучения, инструктажа и задания." },
        { tone: "warning", label: "Важно", title: "Сомнение = стоп", text: "Если допуск или задание неясны, работу не начинаем." },
        { tone: "ppe", label: "СИЗ", title: "Проверка до пуска", text: "СИЗ, рабочее место и крепление проверяются до включения." }
      ],
      summary: ["Нет допуска — нет работы.", "Перед запуском проверяется весь контур: человек, место, станок, деталь.", "Неясную ситуацию уточняем у руководителя."],
      miniQuestion: {
        question: "Что делать, если нет допуска или задания?",
        options: ["начать на малых оборотах", "не приступать и уточнить у руководителя", "попросить коллегу включить станок", "пройти только видео"],
        answer: 1,
        feedback: "Без допуска, задания и понимания операции работать на станке нельзя."
      }
    },
    "ppe-cards": {
      cards: [
        { tone: "ppe", label: "СИЗ", title: "Очки / щиток", text: "Защита глаз обязательна до начала работы." },
        { tone: "required", label: "Обязательно", title: "Одежда без свободных концов", text: "Манжеты застегнуты, шнуры и края убраны." },
        { tone: "warning", label: "Важно", title: "Повреждение = замена", text: "Порванные, грязные или неисправные СИЗ не используют." }
      ],
      summary: ["СИЗ надеваются до подхода к станку.", "Свободные элементы одежды убираются.", "Поврежденные СИЗ заменяются до начала работы."],
      miniQuestion: {
        question: "Что обязательно до подхода к станку?",
        options: ["только проверить заготовку", "очки или щиток, спецодежда, спецобувь и исправные СИЗ", "снять очки для лучшего обзора", "надеть свободную одежду поверх СИЗ"],
        answer: 1,
        feedback: "Перед работой нужны исправные СИЗ: защита глаз, спецодежда, спецобувь и убранные свободные элементы."
      }
    },
    "machine-check": {
      cards: [
        { tone: "risk", label: "Высокий риск", title: "Электрика", text: "Кабель, кнопки, корпус и заземление осматриваются до пуска." },
        { tone: "warning", label: "Стоп-сигнал", title: "Запах гари / вибрация", text: "При признаках неисправности станок не включают." },
        { tone: "required", label: "Обязательно", title: "Пуск без нагрузки", text: "Проверка проходит до сверления и без установленной операции." }
      ],
      summary: ["Сначала проверка, потом работа.", "Любой дефект — остановка и сообщение руководителю.", "Исправность органов управления важнее скорости операции."]
    },
    "part-fixing": {
      cards: [
        { tone: "required", label: "Обязательно", title: "Тиски или приспособление", text: "Деталь фиксируется до пуска, а не удерживается рукой." },
        { tone: "forbidden", label: "Запрещено", title: "Ключ в патроне", text: "Ключ убирают до включения станка." },
        { tone: "risk", label: "Высокий риск", title: "Проворот детали", text: "При провороте останавливают станок и исправляют крепление." }
      ],
      summary: ["Руки не заменяют крепление.", "Ключ и инструмент убраны до запуска.", "Проворот детали требует остановки."]
    },
    "safe-drilling": {
      cards: [
        { tone: "required", label: "Шаги", title: "Кернение → крепление → подача", text: "Операция идет по порядку, без рывков и спешки." },
        { tone: "warning", label: "Важно", title: "Выход сверла", text: "На выходе подачу уменьшают, чтобы снизить заклинивание." },
        { tone: "risk", label: "Риск", title: "Вибрация", text: "Вибрация означает остановку и повторную проверку крепления." }
      ],
      summary: ["Подача плавная, контроль постоянный.", "На выходе сверла усилие снижается.", "Вибрация и необычный звук — повод остановиться."]
    },
    "forbidden-actions": {
      cards: [
        { tone: "forbidden", label: "Запрещено", title: "Тормозить патрон руками", text: "Остановка выполняется только штатным управлением." },
        { tone: "forbidden", label: "Запрещено", title: "Крепить на ходу", text: "Любые регулировки — после остановки." },
        { tone: "warning", label: "Стоп", title: "Неисправность", text: "При дефекте работу не продолжают даже кратковременно." }
      ],
      summary: ["Запреты действуют всегда, даже на малых оборотах.", "Регулировка и крепление — только после полной остановки.", "Неисправность останавливает работу."]
    },
    "emergency-situations": {
      cards: [
        { tone: "warning", label: "Авария", title: "Пожар", text: "Прекратить работу, по возможности отключить питание, вызвать 101/112." },
        { tone: "risk", label: "Высокий риск", title: "Поражение током", text: "Сначала обесточить, затем помогать без риска для себя." },
        { tone: "required", label: "Сообщить", title: "Руководитель", text: "Любая нештатная ситуация фиксируется и передается ответственному." }
      ],
      summary: ["Сначала убираем источник опасности.", "Помощь не должна создавать новую травму.", "Номера служб: 101, 103, 112."]
    },
    "emergency-algorithm": {
      cards: [
        { tone: "required", label: "Алгоритм", title: "Стоп → отключить → сообщить", text: "Действия короткие, без лишних перемещений и самодеятельности." },
        { tone: "warning", label: "Важно", title: "Первая помощь", text: "Помогаем только когда это безопасно для себя и окружающих." },
        { tone: "summary", label: "Памятка", title: "101 / 103 / 112", text: "Службы вызываются сразу, если есть пожар, травма или угроза жизни." }
      ],
      summary: ["Действуй по порядку.", "Не запускай оборудование до разрешения.", "Сохраняй обстановку только если это безопасно."]
    },
    "finish-work": {
      cards: [
        { tone: "required", label: "Обязательно", title: "Питание отключено", text: "Станок оставляют только в безопасном состоянии." },
        { tone: "warning", label: "Важно", title: "Стружка убрана", text: "Уборка выполняется безопасным инструментом, не руками." },
        { tone: "summary", label: "Передать", title: "Замечания руководителю", text: "Неисправности и отклонения сообщаются до завершения смены." }
      ],
      summary: ["Отключить питание.", "Убрать инструмент, заготовки и стружку.", "Передать замечания руководителю."],
      miniQuestion: {
        question: "Что нужно передать руководителю после работы?",
        options: ["только количество деталей", "неисправности, отклонения и замечания", "личные планы на смену", "ничего, если станок выключен"],
        answer: 1,
        feedback: "После работы руководителю передают все неисправности, отклонения и замечания по оборудованию и месту."
      }
    }
  };

  const LEARNING_FOCUS_FLOW = [
    {
      id: "training-intro",
      number: "5.1",
      title: "Введение в обучение",
      lead: "За несколько шагов разберем, где риск, как защититься и что делать перед запуском.",
      badge: { label: "Старт", tone: "info" },
      visualType: "intro",
      cards: [
        { tone: "info", icon: "play", title: "Сначала понять", text: "Смотрите на станок как на источник конкретных рисков." },
        { tone: "required", icon: "shield", title: "Потом защититься", text: "СИЗ и проверка места идут до любой операции." },
        { tone: "safe", icon: "certificate", title: "В конце подтвердить", text: "После обучения будет короткая проверка знаний." }
      ]
    },
    {
      id: "hazard-map-simple",
      number: "5.2",
      title: "Карта опасных зон",
      lead: "Главная мысль: руки, одежда и предметы не попадают в зону вращения и стружки.",
      badge: { label: "Высокий риск", tone: "danger" },
      visualType: "hazard-map-simple",
      cards: [
        { tone: "danger", icon: "rotate", title: "Патрон", text: "захват одежды, ключа или руки" },
        { tone: "warning", icon: "chips", title: "Стружка", text: "отлет частиц в лицо и на руки" },
        { tone: "required", icon: "clamp", title: "Деталь", text: "только надежное крепление до пуска" }
      ]
    },
    {
      id: "main-risks",
      number: "5.3",
      title: "Основные риски",
      lead: "Запомните четыре риска: вращение, стружка, электричество и проворот детали.",
      badge: { label: "Риски", tone: "warning" },
      visualType: "risk-cards",
      cards: [
        { tone: "danger", icon: "rotate", title: "Вращение", text: "не приближать руки и свободные элементы одежды" },
        { tone: "warning", icon: "chips", title: "Стружка", text: "защитить глаза и не убирать руками" },
        { tone: "danger", icon: "bolt", title: "Электрика", text: "поврежденный кабель или запах гари = стоп" },
        { tone: "warning", icon: "clamp", title: "Проворот", text: "деталь должна быть закреплена до пуска" }
      ]
    },
    {
      id: "ppe-focus",
      number: "5.4",
      title: "СИЗ",
      lead: "СИЗ надеваются до подхода к станку и должны быть исправны.",
      badge: { label: "СИЗ", tone: "safe" },
      visualType: "ppe-focus",
      cards: [
        { tone: "safe", icon: "eye", title: "Очки / щиток", text: "защита от стружки и частиц" },
        { tone: "required", icon: "suit", title: "Спецодежда", text: "манжеты застегнуты, края не свисают" },
        { tone: "safe", icon: "shoe", title: "Спецобувь", text: "устойчивая подошва без скольжения" },
        { tone: "warning", icon: "shield", title: "Исправность", text: "поврежденные СИЗ заменить до работы" }
      ]
    },
    {
      id: "before-start-actions",
      number: "5.5",
      title: "Перед началом работы",
      lead: "Пуск разрешен только после короткой проверки человека, места, станка и детали.",
      badge: { label: "Чеклист", tone: "info" },
      visualType: "steps",
      cards: [
        { tone: "required", icon: "user", title: "Допуск", text: "инструктаж и задание понятны" },
        { tone: "safe", icon: "shield", title: "СИЗ", text: "надеты и исправны" },
        { tone: "info", icon: "wrench", title: "Станок", text: "пуск/стоп, кабель и заземление проверены" },
        { tone: "required", icon: "clamp", title: "Крепление", text: "сверло и деталь зафиксированы" }
      ]
    },
    {
      id: "forbidden-focus",
      number: "5.6",
      title: "Что запрещено",
      lead: "Эти действия нельзя выполнять даже быстро, аккуратно или на малых оборотах.",
      badge: { label: "Запрещено", tone: "danger" },
      visualType: "dont",
      cards: [
        { tone: "danger", icon: "stop", title: "Держать деталь руками", text: "используйте тиски или приспособление" },
        { tone: "danger", icon: "rotate", title: "Тормозить патрон", text: "только штатная остановка" },
        { tone: "danger", icon: "wrench", title: "Крепить на ходу", text: "сначала полная остановка" },
        { tone: "warning", icon: "alert", title: "Работать с дефектом", text: "неисправность передать руководителю" }
      ]
    },
    {
      id: "remember",
      number: "5.7",
      title: "Что запомнить",
      lead: "Четыре правила закрывают большинство опасных ситуаций на сверлильном станке.",
      badge: { label: "Итог", tone: "safe" },
      visualType: "summary",
      cards: [
        { tone: "required", icon: "eye", title: "Дистанция", text: "руки и одежда вне зоны вращения" },
        { tone: "required", icon: "clamp", title: "Фиксация", text: "деталь закреплена до пуска" },
        { tone: "warning", icon: "stop", title: "Стоп", text: "вибрация, запах, повреждение = остановка" },
        { tone: "safe", icon: "shield", title: "Сообщить", text: "риски и дефекты передаются руководителю" }
      ]
    },
    {
      id: "mini-knowledge-check",
      number: "5.8",
      title: "Мини-проверка знаний",
      lead: "Ответьте на вопрос, чтобы перейти к итоговому тесту.",
      badge: { label: "Проверка знаний", tone: "info" },
      visualType: "knowledge",
      cards: [
        { tone: "info", icon: "quiz", title: "Проверьте главный принцип", text: "что сделать при вибрации или признаке неисправности?" }
      ],
      miniQuestion: {
        question: "Что делать при вибрации, запахе гари или повреждении кабеля?",
        options: [
          "продолжить работу до конца операции",
          "остановить станок, не запускать повторно и сообщить руководителю",
          "уменьшить подачу и работать медленнее",
          "попросить коллегу придержать деталь"
        ],
        answer: 1,
        feedback: "Любой стоп-сигнал требует остановки, запрета повторного запуска и сообщения руководителю."
      }
    }
  ];

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

  function selectedCommonBlocks() {
    const unit = selectedUnit();
    if (!unit.commonTrainingRequired || !unit.commonTrainingId) {
      return [];
    }
    return unit.commonBlocks || [];
  }

  function hasDepartmentCommonBlock(unit = selectedUnit()) {
    return Boolean(unit.commonTrainingRequired && unit.commonTrainingId && unit.commonBlocks && unit.commonBlocks.length);
  }

  function resetDepartmentProgress() {
    state.departmentLearningIndex = 0;
    state.visitedDepartmentLearning = new Set();
    state.departmentMiniAnswers = {};
    state.departmentCommonComplete = !hasDepartmentCommonBlock();
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
    if (unit.sectionName) {
      return unit.sectionName;
    }
    const hasReady = (unit.equipment || []).some((equipment) => equipment.status === "ready");
    return hasReady ? "ИОТ-47 доступна" : "модуль готовится";
  }

  function unitRouteName(unit) {
    return unit.sectionName ? `${unit.name} · ${unit.sectionName}` : unit.name;
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
      ["unit", "Подразделение"]
    ];

    if (hasDepartmentCommonBlock()) {
      steps.push(["department-learning", "Общий блок"]);
    }

    steps.push(
      ["equipment", "Установка"],
      ["video", "Видео"],
      ["learning", "Обучение"],
      ["test", "Тест"],
      ["certificate", "Сертификат"]
    );
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
    if (unit.sectionName) {
      parts.push(unit.sectionName);
    }
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
    const unit = selectedUnit();
    const nodes = [
      { label: "Организация", value: selectedOrganization().name, status: "done" },
      { label: typeLabel(unit.type), value: unit.name, status: unit.sectionName ? "done" : "active" }
    ];

    if (unit.sectionName) {
      nodes.push({
        label: "Участок",
        value: unit.sectionName,
        status: includeEquipment ? "done" : "active"
      });
    }

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
    const steps = [
      { icon: "play", title: "Видео", text: "короткий вводный блок" },
      { icon: "shield", title: "Карточки правил", text: "риски, запреты и СИЗ" },
      { icon: "quiz", title: "Проверка знаний", text: "вопросы по ключевым действиям" },
      { icon: "certificate", title: "QR-сертификат", text: "подтверждение допуска" }
    ];

    app.innerHTML = `
      <section class="welcome-screen">
        <div class="welcome-hero">
          <div class="welcome-hero-bg" aria-hidden="true"></div>
          <div class="welcome-copy">
            <p class="welcome-badge">ИЦ ТМК · цифровой инструктаж</p>
            <h1>Инструктаж по охране труда</h1>
            <p class="welcome-lead">Пройдите инструктаж, проверьте знания и получите подтверждение допуска</p>
            <div class="welcome-actions">
              <button class="btn primary welcome-main-btn" type="button" data-action="go" data-view="identity">Начать инструктаж</button>
            </div>
          </div>
          <div class="welcome-status-card" aria-label="Маршрут инструктажа">
            <span>Маршрут</span>
            <strong>Видео → правила → тест → сертификат</strong>
            <p>Единый путь для подтверждения допуска к безопасной работе.</p>
          </div>
        </div>

        <div class="scenario-grid" aria-label="Выбор сценария инструктажа">
          <article class="scenario-card guest">
            <div class="scenario-icon">${renderIcon("user")}</div>
            <div>
              <span>Сценарий</span>
              <h2>Гость</h2>
              <p>Краткий вводный инструктаж для посещения территории</p>
            </div>
            <a class="btn secondary" href="https://alex211882.github.io/defender/" target="_blank" rel="noopener noreferrer">Пройти как гость</a>
          </article>

          <article class="scenario-card employee">
            <div class="scenario-icon">${renderIcon("building")}</div>
            <div>
              <span>Сценарий</span>
              <h2>Сотрудник</h2>
              <p>Инструктаж по подразделению, лаборатории и установке</p>
            </div>
            <button class="btn primary" type="button" data-action="go" data-view="identity">Выбрать подразделение</button>
          </article>
        </div>

        <section class="instruction-flow" aria-label="Как проходит инструктаж">
          <div class="instruction-flow-head">
            <span>Как проходит инструктаж</span>
            <strong>Понятный маршрут без лишней служебной информации</strong>
          </div>
          <div class="instruction-flow-grid">
            ${steps
              .map(
                (item, index) => `
                  <article>
                    <i>${index + 1}</i>
                    <span>${renderIcon(item.icon)}</span>
                    <strong>${escapeHtml(item.title)}</strong>
                    <p>${escapeHtml(item.text)}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      </section>
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
    const unit = selectedUnit();
    const needsCommonBlock = hasDepartmentCommonBlock(unit) && !state.departmentCommonComplete;

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
          <button class="btn primary" type="button" data-action="continue-unit">${needsCommonBlock ? "Пройти общий блок" : "Выбрать установку"}</button>
        </div>
      </section>
    `;
  }

  function renderEquipmentSelection() {
    const unit = selectedUnit();
    if (hasDepartmentCommonBlock(unit) && !state.departmentCommonComplete) {
      setView("department-learning");
      return;
    }
    const equipmentItems = unit.equipment || [];
    const equipment = selectedEquipment();
    const isSeamlessDepartment = unit.id === "seamless-pipe-department";

    app.innerHTML = `
      ${renderSteps("equipment")}
      <section class="equipment-card-screen">
        <div class="screen-heading">
          <p class="eyebrow">Шаг 3</p>
          <h2>${isSeamlessDepartment ? "Выберите установку" : "Выбор установки"}</h2>
          <p>${
            isSeamlessDepartment
              ? "Далее будет показан принцип работы и нюансы охраны труда для выбранного оборудования."
              : "Для готовых модулей можно сразу начать обучение. Для остальных направлений показана заглушка."
          }</p>
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
        ${equipment.description ? `<p>${escapeHtml(equipment.description)}</p>` : ""}
        <small>Инструкция: ${escapeHtml(equipment.instruction || "не назначена")}</small>
        <small>Подразделение: ${escapeHtml(unitRouteName(selectedUnit()))}</small>
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
        <strong>${escapeHtml(unit.sectionName || unit.name)}</strong>
        ${unit.sectionName ? `<small>В составе: ${escapeHtml(unit.name)}</small>` : ""}
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
    const videoBrief = equipment.videoBrief || {
      title: equipment.name,
      focus: "Смотрите короткими фрагментами: где опасная зона, какие СИЗ нужны и когда оборудование нужно остановить.",
      watchlist: [
        "положение рук относительно опасной зоны",
        "куда отлетает стружка и фрагменты",
        "что считается стоп-сигналом"
      ],
      cards: [
        { tone: "risk", icon: "alert", label: "Высокий риск", title: "Опасная зона", text: "обратите внимание на движущиеся части" },
        { tone: "ppe", icon: "shield", label: "СИЗ", title: "Защита до запуска", text: "проверить СИЗ до подхода к оборудованию" },
        { tone: "forbidden", icon: "stop", label: "Запрещено", title: "Руки у механизма", text: "ручные операции только после остановки" },
        { tone: "warning", icon: "bolt", label: "Стоп-сигнал", title: "Вибрация / запах / провод", text: "остановить работу и сообщить руководителю" }
      ]
    };
    const videoToneClass = {
      risk: "risk",
      ppe: "ppe",
      forbidden: "forbidden",
      warning: "warning",
      summary: "ppe"
    };

    app.innerHTML = `
      ${renderSteps("video")}
      <section class="learning-layout">
        <div class="screen-heading">
          <p class="eyebrow">Видео</p>
          <h2>${escapeHtml(videoBrief.title || "Принцип работы установки")}</h2>
          <p>${escapeHtml(equipment.name)} · ${escapeHtml(equipment.instruction)} · видео объясняет процесс и опасные зоны без реального запуска оборудования.</p>
        </div>

        ${renderBreadcrumbs()}

        <div class="video-shell">
          <video id="trainingVideo" class="${state.videoMissing ? "is-hidden" : ""}" controls playsinline preload="metadata" poster="assets/img/industrial-safety-panel.png">
            <source src="${escapeHtml(equipment.video)}" type="video/mp4">
          </video>
          <div id="videoFallback" class="video-fallback ${state.videoMissing ? "" : "is-hidden"}">
            <span class="fallback-mark"></span>
            <h3>Видео-заглушка: принцип работы</h3>
            <p>Файл ${escapeHtml(equipment.video)} не найден. Съёмка предполагается на остановленном оборудовании: стрелки, схемы, стоп-кадры, титры и подсветка опасных зон.</p>
          </div>
          <aside class="video-insight-panel">
            <span>В фокусе</span>
            <strong>${escapeHtml(videoBrief.focus || "Принцип работы и опасные зоны")}</strong>
            <p>Видео не заменяет ИОТ: оно помогает понять, что движется, где появляется риск и почему дальше идут правила охраны труда.</p>
            <ul class="video-watchlist">
              ${(videoBrief.watchlist || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </aside>
        </div>

        <section class="video-brief-grid" aria-label="Что отследить в видео">
          ${(videoBrief.cards || [])
            .map(
              (card) => `
                <article class="video-brief-card ${videoToneClass[card.tone] || "warning"}">
                  <span>${renderIcon(card.icon || "alert")}</span>
                  <small>${escapeHtml(card.label || "Важно")}</small>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                </article>
              `
            )
            .join("")}
        </section>

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

  function learningBriefing(block) {
    return LEARNING_BRIEFINGS[block.id] || {};
  }

  function briefingToneIcon(tone) {
    return {
      required: "check",
      forbidden: "stop",
      warning: "alert",
      risk: "alert",
      ppe: "shield",
      summary: "certificate"
    }[tone] || "check";
  }

  function renderBriefingCards(block) {
    const briefing = learningBriefing(block);
    const cards = block.briefingCards || briefing.cards || [];
    if (!cards.length) {
      return "";
    }

    return `
      <section class="briefing-card-grid" aria-label="Короткие карточки инструктажа">
        ${cards
          .map(
            (card) => `
              <article class="briefing-card ${escapeHtml(card.tone || "required")}">
                <span class="briefing-card-icon">${renderIcon(briefingToneIcon(card.tone))}</span>
                <div>
                  <small>${escapeHtml(card.label || "Важно")}</small>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </section>
    `;
  }

  function renderSummaryBlock(block) {
    const briefing = learningBriefing(block);
    const summary = block.summary || briefing.summary || [];
    if (!summary.length) {
      return "";
    }

    return `
      <section class="learning-summary" aria-label="Краткий итог блока">
        <div class="learning-summary-head">
          <span>${renderIcon("certificate")}</span>
          <div>
            <small>Коротко</small>
            <strong>Что унести из блока</strong>
          </div>
        </div>
        <div class="learning-summary-list">
          ${summary.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
        </div>
      </section>
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
      play:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></svg>',
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
    const mini = block.miniQuestion || learningBriefing(block).miniQuestion;
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

  function learningFlowScreens() {
    const current = selectedModule();
    return current?.learningScreens || LEARNING_FOCUS_FLOW;
  }

  function focusBadgeClass(tone) {
    return {
      danger: "badge-danger",
      warning: "badge-forbidden",
      safe: "badge-mandatory",
      info: "badge-mandatory"
    }[tone] || "badge-mandatory";
  }

  function focusCardClass(tone) {
    return {
      danger: "danger",
      warning: "warning",
      safe: "safe",
      required: "required",
      info: "info"
    }[tone] || "info";
  }

  function focusCardLimit(screen) {
    return Number.isFinite(screen.cardLimit) ? screen.cardLimit : 4;
  }

  function renderFocusCards(screen) {
    const limit = focusCardLimit(screen);
    const cards = (screen.cards || []).slice(0, limit);
    if (!cards.length) {
      return "";
    }

    return `
      <div class="focus-card-grid" aria-label="Ключевые карточки экрана">
        ${cards
          .map(
            (card) => `
              <article class="focus-card ${focusCardClass(card.tone)}">
                <span>${renderIcon(card.icon || "check")}</span>
                <div>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderCommonCard(card, index, className = "") {
    return `
      <article class="common-card ${focusCardClass(card.tone)} ${className}">
        <span>${renderIcon(card.icon || "check")}</span>
        <div>
          <small>${String(index + 1).padStart(2, "0")}</small>
          <strong>${escapeHtml(card.title)}</strong>
          <p>${escapeHtml(card.text)}</p>
        </div>
      </article>
    `;
  }

  function renderCommonGridVisual(screen, className = "common-info-grid") {
    const cards = (screen.cards || []).slice(0, focusCardLimit(screen));
    return `
      <div class="common-onboarding-visual ${className}">
        ${cards.map((card, index) => renderCommonCard(card, index)).join("")}
      </div>
    `;
  }

  function renderCommonChecklistVisual(screen) {
    const cards = (screen.cards || []).slice(0, focusCardLimit(screen));
    return `
      <div class="common-checklist-visual">
        ${cards
          .map(
            (card, index) => `
              <article class="${focusCardClass(card.tone)}">
                <i>${renderIcon(card.icon || "check")}</i>
                <div>
                  <small>${String(index + 1).padStart(2, "0")}</small>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderCommonDoDontVisual(screen) {
    const cards = (screen.cards || []).slice(0, focusCardLimit(screen));
    const safeCards = cards.filter((card) => !["danger", "warning"].includes(card.tone));
    const stopCards = cards.filter((card) => ["danger", "warning"].includes(card.tone));
    const renderList = (items) => items.map((card) => `<li>${renderIcon(card.icon || "check")}<span>${escapeHtml(card.title)}<small>${escapeHtml(card.text)}</small></span></li>`).join("");

    return `
      <div class="common-dodont-visual">
        <article class="do">
          <b>Проверить</b>
          <ul>${renderList(safeCards)}</ul>
        </article>
        <article class="dont">
          <b>Остановиться</b>
          <ul>${renderList(stopCards)}</ul>
        </article>
      </div>
    `;
  }

  function renderCommonTimelineVisual(screen) {
    const cards = (screen.cards || []).slice(0, focusCardLimit(screen));
    return `
      <div class="common-timeline-visual">
        ${cards
          .map(
            (card, index) => `
              <article class="${focusCardClass(card.tone)}">
                <i>${index + 1}</i>
                <span>${renderIcon(card.icon || "check")}</span>
                <strong>${escapeHtml(card.title)}</strong>
                <p>${escapeHtml(card.text)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderSimpleHazardVisual() {
    const zones = [
      { label: "Патрон", icon: "rotate", x: 52, y: 20 },
      { label: "Сверло", icon: "chips", x: 50, y: 39 },
      { label: "Деталь", icon: "clamp", x: 46, y: 62 }
    ];

    return `
      <div class="focus-machine-map" aria-label="Упрощенная карта опасных зон">
        <div class="focus-machine-glow"></div>
        <div class="focus-machine-head"></div>
        <div class="focus-machine-spindle"></div>
        <div class="focus-machine-table"></div>
        <div class="focus-machine-base"></div>
        ${zones
          .map(
            (zone, index) => `
              <div class="focus-zone" style="left:${zone.x}%; top:${zone.y}%;">
                <i>${index + 1}</i>
                <span>${renderIcon(zone.icon)}</span>
                <b>${escapeHtml(zone.label)}</b>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderDoDontVisual(screen) {
    return `
      <div class="focus-dodont">
        <article class="do">
          <span>${renderIcon("check")}</span>
          <strong>Делать</strong>
          <p>Остановить станок, дождаться полной остановки, затем исправить ситуацию.</p>
        </article>
        <article class="dont">
          <span>${renderIcon("stop")}</span>
          <strong>Не делать</strong>
          <p>Не держать руками, не тормозить патрон, не регулировать на ходу.</p>
        </article>
      </div>
      ${renderFocusCards(screen)}
    `;
  }

  function renderZoneMapVisual(screen) {
    const zones = screen.zones || (screen.cards || []).map((card) => card.title).slice(0, 3);
    return `
      <div class="equipment-zone-visual" aria-label="Схема опасных зон">
        <div class="equipment-zone-grid">
          <i class="zone-machine-line"></i>
          <i class="zone-machine-core"></i>
          <i class="zone-motion-arrow"></i>
          ${zones
            .slice(0, 3)
            .map(
              (zone, index) => `
                <span class="zone-pin pin-${index + 1}">
                  <b>${index + 1}</b>
                  ${escapeHtml(zone)}
                </span>
              `
            )
            .join("")}
        </div>
        ${renderFocusCards(screen)}
      </div>
    `;
  }

  function renderSequenceVisual(screen) {
    return `
      <div class="focus-sequence" aria-label="Последовательность действий">
        ${(screen.cards || [])
          .slice(0, 4)
          .map(
            (card, index) => `
              <article class="${focusCardClass(card.tone)}">
                <i>${index + 1}</i>
                <span>${renderIcon(card.icon || "check")}</span>
                <strong>${escapeHtml(card.title)}</strong>
                <p>${escapeHtml(card.text)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderControlPanelVisual(screen) {
    return `
      <div class="focus-control-visual">
        <div class="control-panel-illustration" aria-label="Пульт управления">
          <span class="panel-screen"></span>
          <span class="panel-stop">STOP</span>
          <span class="panel-button safe"></span>
          <span class="panel-button warn"></span>
          ${screen.callout ? `<b class="panel-callout">${escapeHtml(screen.callout)}</b>` : ""}
        </div>
        ${renderFocusCards(screen)}
      </div>
    `;
  }

  function renderFocusVisual(screen) {
    if (screen.visualType === "intro") {
      return `
        <div class="focus-route-visual">
          ${["Понять риск", "Надеть СИЗ", "Проверить станок", "Ответить на вопрос"]
            .map(
              (item, index) => `
                <article>
                  <i>${index + 1}</i>
                  <strong>${escapeHtml(item)}</strong>
                </article>
              `
            )
            .join("")}
        </div>
        ${renderFocusCards(screen)}
      `;
    }

    if (screen.visualType === "hazard-map-simple") {
      return `
        ${renderSimpleHazardVisual()}
        ${renderFocusCards(screen)}
      `;
    }

    if (screen.visualType === "zone-map" || screen.visualType === "check-map") {
      return renderZoneMapVisual(screen);
    }

    if (screen.visualType === "sequence" || screen.visualType === "algorithm" || screen.visualType === "roles") {
      return renderSequenceVisual(screen);
    }

    if (screen.visualType === "control-panel") {
      return renderControlPanelVisual(screen);
    }

    if (screen.visualType === "info-cards") {
      return renderCommonGridVisual(screen, "common-info-grid");
    }

    if (screen.visualType === "ppe-cards") {
      return renderCommonGridVisual(screen, "common-ppe-grid");
    }

    if (screen.visualType === "checklist-card") {
      return renderCommonChecklistVisual(screen);
    }

    if (screen.visualType === "do-dont-card") {
      return renderCommonDoDontVisual(screen);
    }

    if (screen.visualType === "role-stepper" || screen.visualType === "emergency-timeline") {
      return renderCommonTimelineVisual(screen);
    }

    if (screen.visualType === "safety-rules-card") {
      return renderCommonGridVisual(screen, "common-safety-grid");
    }

    if (screen.visualType === "steps") {
      return `
        <div class="focus-step-list">
          ${(screen.cards || [])
            .slice(0, 4)
            .map(
              (card, index) => `
                <article class="${focusCardClass(card.tone)}">
                  <i>${index + 1}</i>
                  <span>${renderIcon(card.icon || "check")}</span>
                  <strong>${escapeHtml(card.title)}</strong>
                  <p>${escapeHtml(card.text)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (screen.visualType === "dont") {
      return renderDoDontVisual(screen);
    }

    if (screen.visualType === "knowledge") {
      return `
        <div class="focus-knowledge-panel">
          <span>${renderIcon("quiz")}</span>
          <div>
            <strong>Один вопрос перед тестом</strong>
            <p>Цель проверки — закрепить стоп-сигнал и правильное действие.</p>
          </div>
        </div>
      `;
    }

    return renderFocusCards(screen);
  }

  function renderDepartmentMiniQuestion(screen) {
    const mini = screen.miniQuestion;
    if (!mini) {
      return "";
    }

    const miniAnswer = state.departmentMiniAnswers[screen.id];
    return `
      <form class="mini-question" aria-label="Мини-проверка общего блока">
        <div>
          <span>${renderIcon("quiz")}</span>
          <strong>${escapeHtml(mini.question)}</strong>
        </div>
        <div class="option-list">
          ${mini.options
            .map(
              (option, index) => `
                <label class="${miniAnswer === index ? "selected" : ""} ${miniAnswer !== undefined && index === mini.answer ? "right" : ""} ${
                miniAnswer === index && index !== mini.answer ? "wrong" : ""
              }">
                  <input type="radio" name="department-mini" value="${index}" ${miniAnswer === index ? "checked" : ""}>
                  <span>${escapeHtml(option)}</span>
                </label>
              `
            )
            .join("")}
        </div>
        <div class="mini-actions">
          <button class="btn secondary" type="button" data-action="answer-department-mini">Ответить</button>
          ${miniAnswer !== undefined ? `<p class="feedback">${escapeHtml(mini.feedback)}</p>` : ""}
        </div>
      </form>
    `;
  }

  function renderDepartmentLearning() {
    const unit = selectedUnit();
    const screens = selectedCommonBlocks();
    if (!screens.length) {
      state.departmentCommonComplete = true;
      setView("equipment");
      return;
    }

    const screen = screens[state.departmentLearningIndex] || screens[0];
    state.visitedDepartmentLearning.add(state.departmentLearningIndex);

    const progress = Math.round(((state.departmentLearningIndex + 1) / screens.length) * 100);
    const allViewed = state.visitedDepartmentLearning.size === screens.length;
    const badge = screen.badge || { label: "Общий блок", tone: "info" };
    const answered = !screen.miniQuestion || state.departmentMiniAnswers[screen.id] !== undefined;

    app.innerHTML = `
      ${renderSteps("department-learning")}
      <section class="learning-screen focus-learning-screen department-common-screen" style="--learning-progress:${progress}%">
        <div class="focus-learning-header">
          <div>
            <div class="learning-title-row">
              <p class="eyebrow">${escapeHtml(unit.commonTitle || "Общие требования охраны труда")}</p>
              <span class="badge ${focusBadgeClass(badge.tone)}">${escapeHtml(badge.label)}</span>
            </div>
            <h2>${escapeHtml(screen.title)}</h2>
            <p class="key-thought">${escapeHtml(screen.lead)}</p>
          </div>
          <div class="focus-step-count">
            <span>Общий блок</span>
            <strong>${state.departmentLearningIndex + 1}/${screens.length}</strong>
          </div>
        </div>

        <p class="department-common-subtitle">${escapeHtml(unit.commonSubtitle || "Правила, обязательные до выбора установки")}</p>

        ${renderBreadcrumbs(false)}

        <div class="progress-block">
          <div class="progress-meta">
            <span>${escapeHtml(screen.number)} · ${escapeHtml(screen.title)}</span>
            <span>${progress}% общего блока</span>
          </div>
          <div class="progress-bar"><span style="width:${progress}%"></span></div>
        </div>

        <div class="learning-mini-stepper" aria-label="Прогресс общего блока">
          ${screens
            .map(
              (item, index) => `
                <span class="${index === state.departmentLearningIndex ? "active" : state.visitedDepartmentLearning.has(index) ? "seen" : ""}" title="${escapeHtml(item.title)}"></span>
              `
            )
            .join("")}
        </div>

        <article class="focus-learning-card ${escapeHtml(screen.visualType)}">
          <div class="focus-main-visual">
            ${renderFocusVisual(screen)}
          </div>
        </article>

        ${renderDepartmentMiniQuestion(screen)}

        <div class="slide-controls no-print">
          <button class="btn ghost" type="button" data-action="department-learning-prev" ${state.departmentLearningIndex === 0 ? "disabled" : ""}>Назад</button>
          ${
            state.departmentLearningIndex < screens.length - 1
              ? '<button class="btn primary" type="button" data-action="department-learning-next">Далее</button>'
              : `<button class="btn primary" type="button" data-action="department-learning-complete" ${allViewed && answered ? "" : "disabled"}>Теперь выберите установку</button>`
          }
        </div>
      </section>
    `;
  }

  function renderLearning() {
    if (!state.videoSeen) {
      setView("video");
      return;
    }

    const screens = learningFlowScreens();
    const screen = screens[state.learningIndex] || screens[0];
    state.visitedLearning.add(state.learningIndex);

    const progress = Math.round(((state.learningIndex + 1) / screens.length) * 100);
    const allViewed = state.visitedLearning.size === screens.length;
    const badge = screen.badge || { label: "Обучение", tone: "info" };

    app.innerHTML = `
      ${renderSteps("learning")}
      <section class="learning-screen focus-learning-screen" style="--learning-progress:${progress}%">
        <div class="focus-learning-header">
          <div>
            <div class="learning-title-row">
              <p class="eyebrow">Пункт ${escapeHtml(screen.number)}</p>
              <span class="badge ${focusBadgeClass(badge.tone)}">${escapeHtml(badge.label)}</span>
            </div>
            <h2>${escapeHtml(screen.title)}</h2>
            <p class="key-thought">${escapeHtml(screen.lead)}</p>
          </div>
          <div class="focus-step-count">
            <span>Экран</span>
            <strong>${state.learningIndex + 1}/${screens.length}</strong>
          </div>
        </div>

        ${renderBreadcrumbs()}

        <div class="progress-block">
          <div class="progress-meta">
            <span>${escapeHtml(screen.number)} · ${escapeHtml(screen.title)}</span>
            <span>${progress}% прохождения</span>
          </div>
          <div class="progress-bar"><span style="width:${progress}%"></span></div>
        </div>

        <div class="learning-mini-stepper" aria-label="Прогресс обучающих модулей">
          ${screens
            .map(
              (item, index) => `
                <span class="${index === state.learningIndex ? "active" : state.visitedLearning.has(index) ? "seen" : ""}" title="${escapeHtml(item.title)}"></span>
              `
            )
            .join("")}
        </div>

        <article class="focus-learning-card ${escapeHtml(screen.visualType)}">
          <div class="focus-main-visual">
            ${renderFocusVisual(screen)}
          </div>
        </article>

        ${renderMiniQuestion(screen)}

        <div class="slide-controls no-print">
          <button class="btn ghost" type="button" data-action="learning-prev" ${state.learningIndex === 0 ? "disabled" : ""}>Назад</button>
          ${
            state.learningIndex < screens.length - 1
              ? '<button class="btn primary" type="button" data-action="learning-next">Далее</button>'
              : `<button class="btn primary" type="button" data-action="to-test" ${allViewed ? "" : "disabled"}>Перейти к тесту</button>`
          }
        </div>
      </section>
    `;
  }

  function renderTest() {
    const current = selectedModule();
    const screens = learningFlowScreens();
    if (state.visitedLearning.size < screens.length) {
      state.learningIndex = Math.min(state.learningIndex, screens.length - 1);
      setView("learning");
      return;
    }

    app.innerHTML = `
      ${renderSteps("test")}
      <section class="test-screen">
        <div class="screen-heading">
          <p class="eyebrow">Итоговый тест</p>
          <h2>${current.test.length} вопросов · проходной балл ${current.passScore}%</h2>
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
      department: unitRouteName(selectedUnit()),
      commonBlock: hasDepartmentCommonBlock() ? "Общие требования охраны труда: пройден" : "",
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
                <th>Общий блок</th>
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
      body.innerHTML = `<tr><td colspan="12" class="empty-cell">Записей не найдено</td></tr>`;
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
            <td>${escapeHtml(item.commonBlock || "—")}</td>
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
    return learningFlowScreens()[state.learningIndex] || learningFlowScreens()[0];
  }

  function currentDepartmentBlock() {
    return selectedCommonBlocks()[state.departmentLearningIndex] || selectedCommonBlocks()[0];
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
      resetDepartmentProgress();
      renderUnitSelection();
      return;
    }

    if (action === "select-unit") {
      state.selection.unitId = target.dataset.id;
      syncUnitSelection();
      resetDepartmentProgress();
      renderUnitSelection();
      return;
    }

    if (action === "continue-unit") {
      if (hasDepartmentCommonBlock() && !state.departmentCommonComplete) {
        setView("department-learning");
        return;
      }
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

    if (action === "department-learning-prev") {
      state.departmentLearningIndex = Math.max(0, state.departmentLearningIndex - 1);
      renderDepartmentLearning();
      return;
    }

    if (action === "department-learning-next") {
      const block = currentDepartmentBlock();
      if (block.miniQuestion && state.departmentMiniAnswers[block.id] === undefined) {
        showToast("Ответьте на мини-вопрос общего блока");
        return;
      }
      state.departmentLearningIndex = Math.min(selectedCommonBlocks().length - 1, state.departmentLearningIndex + 1);
      renderDepartmentLearning();
      return;
    }

    if (action === "answer-department-mini") {
      const checked = document.querySelector('input[name="department-mini"]:checked');
      if (!checked) {
        showToast("Выберите вариант ответа");
        return;
      }
      const block = currentDepartmentBlock();
      state.departmentMiniAnswers[block.id] = Number(checked.value);
      renderDepartmentLearning();
      return;
    }

    if (action === "department-learning-complete") {
      const block = currentDepartmentBlock();
      if (block.miniQuestion && state.departmentMiniAnswers[block.id] === undefined) {
        showToast("Ответьте на мини-вопрос общего блока");
        return;
      }
      if (state.visitedDepartmentLearning.size < selectedCommonBlocks().length) {
        showToast("Просмотрите все слайды общего блока");
        return;
      }
      state.departmentCommonComplete = true;
      setView("equipment");
      return;
    }

    if (action === "begin-training") {
      if (hasDepartmentCommonBlock() && !state.departmentCommonComplete) {
        showToast("Сначала пройдите общий блок отдела");
        setView("department-learning");
        return;
      }
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
      state.learningIndex = Math.min(learningFlowScreens().length - 1, state.learningIndex + 1);
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
      if (state.visitedLearning.size < learningFlowScreens().length) {
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
      "department-learning": renderDepartmentLearning,
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
