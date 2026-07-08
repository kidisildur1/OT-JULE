const SEAMLESS_TUBES_COMMON_TRAINING_ID = "seamless-tubes-common";

const seamlessTubeCommonBlocks = [
  {
    id: "seamless-common-admission",
    number: "1",
    title: "Допуск к работе",
    lead: "К работе приступают только после допуска, понятного задания и нормального самочувствия.",
    badge: { label: "Обязательно", tone: "safe" },
    visualType: "info-cards",
    cardLimit: 5,
    cards: [
      { tone: "required", icon: "certificate", title: "Прошел инструктаж", text: "знает требования перед началом работы" },
      { tone: "info", icon: "check", title: "Понимает задачу", text: "ясно, что именно поручено выполнить" },
      { tone: "warning", icon: "stop", title: "Не делает лишнего", text: "не выполняет непорученные действия" },
      { tone: "warning", icon: "alert", title: "Самочувствие", text: "при недомогании не приступает к работе" },
      { tone: "required", icon: "user", title: "Есть сомнение", text: "обращается к руководителю" }
    ]
  },
  {
    id: "seamless-common-ppe",
    number: "2",
    title: "СИЗ обязательны",
    lead: "СИЗ надевают до входа в рабочую зону и проверяют их исправность.",
    badge: { label: "СИЗ", tone: "safe" },
    visualType: "ppe-cards",
    cardLimit: 5,
    cards: [
      { tone: "safe", icon: "suit", title: "Спецодежда", text: "исправна и застегнута" },
      { tone: "safe", icon: "shoe", title: "Спецобувь", text: "используется на рабочем месте" },
      { tone: "safe", icon: "eye", title: "Очки или щиток", text: "защищают глаза и лицо" },
      { tone: "info", icon: "shield", title: "Перчатки", text: "применяются при необходимости" },
      { tone: "danger", icon: "stop", title: "Нет СИЗ", text: "к работе не приступать" }
    ]
  },
  {
    id: "seamless-common-workplace",
    number: "3",
    title: "Рабочее место перед началом",
    lead: "До запуска рабочая зона должна быть свободной, освещенной и готовой к безопасной эвакуации.",
    badge: { label: "Проверить", tone: "info" },
    visualType: "checklist-card",
    cardLimit: 5,
    cards: [
      { tone: "safe", icon: "clean", title: "Убрать лишнее", text: "ничего не мешает работе" },
      { tone: "required", icon: "center", title: "Проходы свободны", text: "пути движения не загромождены" },
      { tone: "required", icon: "shield", title: "Эвакуация доступна", text: "пути выхода не перекрыты" },
      { tone: "info", icon: "check", title: "Аптечка", text: "место известно и доступно" },
      { tone: "warning", icon: "fire", title: "Огнетушитель", text: "средства пожаротушения на месте" }
    ]
  },
  {
    id: "seamless-common-equipment-check",
    number: "4",
    title: "Исправность оборудования и инструмента",
    lead: "Любая неисправность останавливает работу до сообщения руководителю.",
    badge: { label: "До пуска", tone: "warning" },
    visualType: "do-dont-card",
    cardLimit: 5,
    cards: [
      { tone: "required", icon: "wrench", title: "Инструмент", text: "исправен и подходит для работы" },
      { tone: "required", icon: "clamp", title: "Крепления", text: "узлы закреплены надежно" },
      { tone: "safe", icon: "shield", title: "Ограждения", text: "защитные элементы установлены" },
      { tone: "safe", icon: "bolt", title: "Заземление", text: "проверено перед пуском" },
      { tone: "warning", icon: "alert", title: "Неисправность", text: "остановиться и сообщить руководителю" }
    ]
  },
  {
    id: "seamless-common-teamwork",
    number: "5",
    title: "Работа не в одиночку",
    lead: "На оборудовании работают минимум два сотрудника с понятными ролями.",
    badge: { label: "Роли", tone: "info" },
    visualType: "role-stepper",
    cardLimit: 5,
    cards: [
      { tone: "required", icon: "user", title: "Минимум двое", text: "работы выполняются не в одиночку" },
      { tone: "required", icon: "center", title: "Оператор", text: "контролирует процесс" },
      { tone: "safe", icon: "eye", title: "Помощник", text: "находится в безопасной зоне" },
      { tone: "danger", icon: "stop", title: "Посторонние", text: "не допускаются к рабочему месту" },
      { tone: "info", icon: "check", title: "Связь", text: "действия согласованы" }
    ]
  },
  {
    id: "seamless-common-electro",
    number: "6",
    title: "Электробезопасность",
    lead: "Электрооборудование проверяют до работы, ремонт выполняют только допущенные лица.",
    badge: { label: "Высокий риск", tone: "danger" },
    visualType: "safety-rules-card",
    cardLimit: 5,
    cards: [
      { tone: "required", icon: "bolt", title: "Рубильники и кнопки", text: "проверить исправность" },
      { tone: "warning", icon: "alert", title: "Провода", text: "осмотреть изоляцию" },
      { tone: "safe", icon: "shield", title: "Заземление", text: "должно быть исправным" },
      { tone: "danger", icon: "bolt", title: "Токоведущие части", text: "не прикасаться" },
      { tone: "danger", icon: "stop", title: "Ремонт", text: "только допущенные лица" }
    ]
  },
  {
    id: "seamless-common-emergency",
    number: "7",
    title: "Аварийная ситуация",
    lead: "При аварии сначала прекращают работу, затем помогают людям и вызывают нужную службу.",
    badge: { label: "Авария", tone: "danger" },
    visualType: "emergency-timeline",
    cardLimit: 6,
    cards: [
      { tone: "danger", icon: "stop", title: "СТОП", text: "прекратить работу" },
      { tone: "safe", icon: "shield", title: "Безопасная зона", text: "вывести пострадавшего" },
      { tone: "required", icon: "user", title: "Первая помощь", text: "оказать помощь" },
      { tone: "info", icon: "user", title: "Руководитель", text: "сообщить начальнику участка" },
      { tone: "warning", icon: "alert", title: "103 / 112", text: "вызвать помощь" },
      { tone: "danger", icon: "fire", title: "101 / 112", text: "при пожаре" }
    ],
    miniQuestion: {
      question: "Что нужно сделать при обнаружении неисправности оборудования?",
      options: [
        "Прекратить работу и сообщить руководителю.",
        "Продолжить работу на малой скорости.",
        "Закрыть неисправность кожухом и закончить операцию.",
        "Попросить коллегу посмотреть после смены."
      ],
      answer: 0,
      feedback: "Правильно: работу прекращают и сразу сообщают руководителю."
    }
  }
];

const seamlessCommonTest = [
  {
    question: "Можно ли работать без необходимых СИЗ?",
    options: ["да, если работа короткая", "нет", "да, если оборудование остановлено", "да, если есть опыт"],
    answer: 1,
    explanation: "СИЗ обязательны до начала работы на оборудовании."
  },
  {
    question: "Что должно быть проверено на рабочем месте перед началом?",
    options: [
      "только наличие заготовки",
      "чистота зоны, проходы, освещение, аптечка и средства пожаротушения",
      "только время смены",
      "только подпись в журнале"
    ],
    answer: 1,
    explanation: "Рабочая зона должна быть свободной, видимой и готовой к безопасной работе."
  },
  {
    question: "Что делать при неисправности оборудования?",
    options: [
      "прекратить работу и сообщить руководителю",
      "закончить операцию на малой скорости",
      "самостоятельно разобрать узел",
      "работать только с помощником"
    ],
    answer: 0,
    explanation: "Неисправное оборудование запрещено использовать до устранения причины."
  },
  {
    question: "Кто ремонтирует электрооборудование?",
    options: ["любой опытный сотрудник", "только допущенные лица", "оператор установки", "помощник оператора"],
    answer: 1,
    explanation: "Электрооборудование ремонтируют только сотрудники с соответствующим допуском."
  },
  {
    question: "Что делать при травме или угрозе жизни?",
    options: [
      "прекратить работу, вывести из опасной зоны, оказать помощь и вызвать 103 или 112",
      "дождаться окончания операции",
      "сообщить только в конце смены",
      "продолжить работу, если травма небольшая"
    ],
    answer: 0,
    explanation: "Аварийные действия начинаются со stop-сигнала, безопасной зоны и вызова помощи."
  }
];

const seamlessTubeEquipment = [
  {
    id: "eu-pppt",
    name: "ЭУ-ПППТ",
    shortName: "ЭУ-ПППТ",
    instruction: "ИОТ-73",
    instructionTitle: "Инструкция по охране труда при работе на ЭУ-ПППТ",
    status: "ready",
    video: {
      title: "ЭУ-ПППТ: принцип работы установки",
      description: "Короткий ролик показывает рабочую клеть, валки, линию привода, пульт управления и основные опасные зоны установки.",
      duration: "80–90 сек",
      src: "assets/video/euppt-principle-720p.mp4"
    },
    developer: "Бараков И.С.",
    safetyResponsible: "Разинькова А.В.",
    description: "Продольная прокатка труб: рабочая клеть, линия привода, межклетевой промежуток",
    riskBadges: ["валки", "привод", "линия выхода", "застревание"],
    videoBrief: {
      title: "Принцип работы установки",
      focus: "Показать назначение, движение образца, рабочую клеть и опасные зоны без реального запуска.",
      watchlist: ["куда движется образец", "где валки захватывают металл", "какие зоны запрещены для нахождения"],
      cards: [
        { tone: "risk", icon: "rotate", label: "Движение", title: "Валки и образец", text: "показываем стрелками и титрами" },
        { tone: "warning", icon: "alert", label: "Опасная зона", title: "Рабочая клеть", text: "подсветка оранжевым" },
        { tone: "forbidden", icon: "stop", label: "Не показывать", title: "Реальный запуск", text: "только остановленное оборудование" },
        { tone: "summary", icon: "eye", label: "Фокус", title: "Линия выхода", text: "схема сверху и стоп-кадры" }
      ]
    }
  },
  {
    id: "hl-6-14",
    name: "Острильный станок HL-6-14",
    shortName: "HL-6-14",
    instruction: "ИОТ-74",
    instructionTitle: "Инструкция по охране труда при работе на острильном станке HL-6-14",
    status: "ready",
    video: "assets/video/hl_6_14_principle.mp4",
    developer: "Бараков И.С.",
    safetyResponsible: "Разинькова А.В.",
    description: "Острильный станок: рабочая сторона, калибры, образцы, режимы работы",
    riskBadges: ["калибры", "образцы", "кожухи", "вибрация"],
    videoBrief: {
      title: "Принцип работы установки",
      focus: "Показать рабочую сторону, последовательность калибров и безопасную подачу образца.",
      watchlist: ["рабочая сторона у тумблера", "последовательность калибров", "почему кожухи обязательны"],
      cards: [
        { tone: "risk", icon: "clamp", label: "Процесс", title: "Калибры по порядку", text: "цепочка проходов на схеме" },
        { tone: "warning", icon: "alert", label: "Опасная зона", title: "Рабочие калибры", text: "подсветка зоны в стоп-кадре" },
        { tone: "forbidden", icon: "stop", label: "Не показывать", title: "Руки у движущихся частей", text: "только безопасная имитация" },
        { tone: "summary", icon: "center", label: "Управление", title: "Рабочий ход", text: "титры на панели режима" }
      ]
    }
  },
  {
    id: "st-hprt",
    name: "ST-ХПРТ",
    shortName: "ST-ХПРТ",
    instruction: "ИОТ-80",
    instructionTitle: "Инструкция по охране труда при работе на стане ST-ХПРТ",
    status: "ready",
    video: "assets/video/st_hprt_principle.mp4",
    developer: "Бараков И.С.",
    safetyResponsible: "Разинькова А.В.",
    description: "Трехвалковый стан винтовой прокатки: валки, линия выхода металла, пульт управления",
    riskBadges: ["три валка", "линия выхода", "пульт", "привод"],
    videoBrief: {
      title: "Принцип работы установки",
      focus: "Показать трехвалковую схему, направление выхода металла и роль оператора у пульта.",
      watchlist: ["зона трех валков", "линия выхода металла", "предупреждение перед запуском"],
      cards: [
        { tone: "risk", icon: "rotate", label: "Движение", title: "Три валка", text: "схема вращения и деформации" },
        { tone: "warning", icon: "alert", label: "Опасная зона", title: "Линия выхода", text: "красно-оранжевая разметка" },
        { tone: "forbidden", icon: "stop", label: "Не показывать", title: "Работающий привод", text: "съемка на остановленном стане" },
        { tone: "summary", icon: "user", label: "Команда", title: "Внимание, запуск стана!", text: "титр и speech bubble" }
      ]
    }
  }
];

const euPpptLearningScreens = [
  {
    id: "eu-pppt-roll-stand",
    number: "ЭУ.1",
    title: "Рабочая клеть и валки",
    lead: "Основная опасность — зона деформации.",
    badge: { label: "Высокий риск", tone: "danger" },
    visualType: "zone-map",
    cards: [
      { tone: "danger", icon: "rotate", title: "Валки", text: "захватывают образец" },
      { tone: "warning", icon: "alert", title: "Деформация", text: "опасная зона в рабочей клети" },
      { tone: "danger", icon: "stop", title: "Руки и одежда", text: "не приближать к движущимся частям" }
    ],
    zones: ["Рабочая клеть", "Валки", "Очаг деформации"],
    miniQuestion: {
      question: "Где возникает основная опасность при прокатке?",
      options: ["у входной двери", "в рабочей клети / зоне валков", "в журнале инструктажа", "только у шкафа"],
      answer: 1,
      feedback: "Главный риск ЭУ-ПППТ находится в рабочей клети и зоне валков."
    }
  },
  {
    id: "eu-pppt-drive-guards",
    number: "ЭУ.2",
    title: "Линия привода и ограждения",
    lead: "Вращающиеся элементы должны быть закрыты.",
    badge: { label: "Ограждения", tone: "warning" },
    visualType: "check-map",
    cards: [
      { tone: "warning", icon: "rotate", title: "Привод и муфта", text: "зона вращения" },
      { tone: "danger", icon: "alert", title: "Шпиндели", text: "опасность захвата" },
      { tone: "safe", icon: "shield", title: "Сетка и кожухи", text: "проверить до пуска" },
      { tone: "required", icon: "clamp", title: "Крепления", text: "узлы закреплены" }
    ],
    miniQuestion: {
      question: "Можно ли работать при снятом ограждении вращающегося узла?",
      options: ["нет", "да, если быстро", "да, если предупредить коллегу", "да, на малой скорости"],
      answer: 0,
      feedback: "Работа при снятых или неисправных ограждениях запрещена."
    }
  },
  {
    id: "eu-pppt-control-panel",
    number: "ЭУ.3",
    title: "Пульт управления",
    lead: "Оператор должен контролировать процесс с пульта.",
    badge: { label: "Контроль", tone: "info" },
    visualType: "control-panel",
    cards: [
      { tone: "required", icon: "user", title: "Оператор", text: "находится за пультом" },
      { tone: "info", icon: "eye", title: "Обзор", text: "контроль процесса" },
      { tone: "danger", icon: "stop", title: "Остановка", text: "при застревании или отклонениях" }
    ],
    miniQuestion: {
      question: "Почему оператор должен находиться у пульта?",
      options: [
        "чтобы контролировать процесс и остановить установку при отклонении",
        "чтобы быстрее заполнить журнал",
        "чтобы стоять ближе к валкам",
        "это не обязательно"
      ],
      answer: 0,
      feedback: "Пульт — точка управления безопасностью и остановкой установки."
    }
  },
  {
    id: "eu-pppt-exit-line",
    number: "ЭУ.4",
    title: "Линия выхода и межклетевой промежуток",
    lead: "Эти зоны запрещены для нахождения во время прокатки.",
    badge: { label: "Запретная зона", tone: "danger" },
    visualType: "zone-map",
    cards: [
      { tone: "danger", icon: "alert", title: "Линия выхода", text: "людям находиться нельзя" },
      { tone: "danger", icon: "stop", title: "Межклетевой промежуток", text: "зона движения образца" },
      { tone: "safe", icon: "eye", title: "Наблюдение", text: "только с безопасной позиции" }
    ],
    zones: ["Линия выхода", "Межклетевой промежуток", "Зона движения"],
    miniQuestion: {
      question: "Где нельзя находиться во время прокатки?",
      options: [
        "на линии выхода металла и в межклетевом промежутке",
        "у входа в помещение",
        "у стенда инструктажа",
        "у аптечки"
      ],
      answer: 0,
      feedback: "Линия выхода и межклетевой промежуток остаются свободными во время прокатки."
    }
  },
  {
    id: "eu-pppt-forbidden",
    number: "ЭУ.5",
    title: "Что запрещено на ЭУ-ПППТ",
    lead: "Любые ручные операции выполняются только при выключенном приводе.",
    badge: { label: "Запрещено", tone: "danger" },
    visualType: "dont",
    cards: [
      { tone: "danger", icon: "stop", title: "Регулировать валки", text: "нельзя при включенном приводе" },
      { tone: "danger", icon: "wrench", title: "Монтаж / демонтаж", text: "только после остановки" },
      { tone: "danger", icon: "eye", title: "Измерять образец", text: "на ходу запрещено" },
      { tone: "danger", icon: "clean", title: "Очищать поверхность", text: "при приводе нельзя" }
    ],
    miniQuestion: {
      question: "Можно ли измерять прокатываемый образец при включенном приводе?",
      options: ["нет", "да, если быстро", "да, если образец длинный", "да, если помощник наблюдает"],
      answer: 0,
      feedback: "Измерение выполняют только после безопасной остановки."
    }
  },
  {
    id: "eu-pppt-deviation",
    number: "ЭУ.6",
    title: "Отклонения и застревание образца",
    lead: "Любое отклонение означает остановку привода.",
    badge: { label: "Стоп-сигнал", tone: "warning" },
    visualType: "algorithm",
    cards: [
      { tone: "warning", icon: "alert", title: "Стук / скрежет", text: "не продолжать работу" },
      { tone: "danger", icon: "stop", title: "Стоп", text: "остановить привод" },
      { tone: "safe", icon: "eye", title: "Проверка", text: "не подходить к опасной зоне" },
      { tone: "required", icon: "wrench", title: "Устранение", text: "после выяснения причины" }
    ],
    miniQuestion: {
      question: "Что делать первым при застревании образца?",
      options: ["остановить привод", "поправить образец руками", "увеличить скорость", "включить реверс без проверки"],
      answer: 0,
      feedback: "Первое действие при застревании — остановить привод."
    }
  }
];

const hlLearningScreens = [
  {
    id: "hl-working-side",
    number: "HL.1",
    title: "Рабочая сторона станка",
    lead: "Образец подают только с рабочей стороны.",
    badge: { label: "Позиция", tone: "info" },
    visualType: "zone-map",
    cards: [
      { tone: "safe", icon: "check", title: "Рабочая сторона", text: "сторона тумблера режима работы" },
      { tone: "danger", icon: "stop", title: "Нерабочая сторона", text: "подача запрещена" },
      { tone: "info", icon: "eye", title: "Обзор", text: "видны зона и органы управления" }
    ],
    zones: ["Рабочая сторона", "Калибры", "Нерабочая сторона"],
    miniQuestion: {
      question: "С какой стороны нужно подавать образец?",
      options: [
        "с рабочей стороны, где расположен тумблер режима работы",
        "с любой удобной стороны",
        "со стороны выхода",
        "сзади станка"
      ],
      answer: 0,
      feedback: "Подача образца выполняется только с рабочей стороны."
    }
  },
  {
    id: "hl-caliber-sequence",
    number: "HL.2",
    title: "Калибры и последовательность",
    lead: "Калибры проходятся строго последовательно.",
    badge: { label: "Порядок", tone: "info" },
    visualType: "sequence",
    cards: [
      { tone: "required", icon: "check", title: "Калибр 1", text: "старт прохода" },
      { tone: "required", icon: "check", title: "Калибр 2", text: "следующий шаг" },
      { tone: "required", icon: "check", title: "Калибр 3", text: "без пропусков" },
      { tone: "required", icon: "check", title: "Калибр 4", text: "после предыдущего" }
    ],
    miniQuestion: {
      question: "Можно ли после калибра №2 сразу перейти к калибру №4?",
      options: ["нет", "да", "да, если образец короткий", "да, если включен рабочий ход"],
      answer: 0,
      feedback: "Калибры проходят по порядку без пропусков."
    }
  },
  {
    id: "hl-sample-check",
    number: "HL.3",
    title: "Образец перед вальцовкой",
    lead: "К работе допускается только исправный образец нужной длины.",
    badge: { label: "Допуск образца", tone: "warning" },
    visualType: "compare",
    cards: [
      { tone: "safe", icon: "check", title: "100–300 мм", text: "допустимая длина" },
      { tone: "danger", icon: "stop", title: "Трещины", text: "образец не допускается" },
      { tone: "danger", icon: "alert", title: "Расслоения", text: "риск разрушения" },
      { tone: "danger", icon: "chips", title: "Заусенцы", text: "нужно исключить" }
    ],
    miniQuestion: {
      question: "Можно ли вальцевать образец длиной 80 мм?",
      options: ["нет", "да", "да, если держать крепче", "да, при рабочем ходе"],
      answer: 0,
      feedback: "Для вальцовки допускают образцы длиной 100–300 мм без опасных дефектов."
    }
  },
  {
    id: "hl-guards",
    number: "HL.4",
    title: "Кожухи и рабочая зона",
    lead: "Работа без кожухов запрещена.",
    badge: { label: "Ограждения", tone: "danger" },
    visualType: "check-map",
    cards: [
      { tone: "safe", icon: "shield", title: "Кожухи", text: "установлены до запуска" },
      { tone: "danger", icon: "stop", title: "Демонтирован кожух", text: "запуск запрещен" },
      { tone: "danger", icon: "alert", title: "За станок", text: "заходить во время работы нельзя" },
      { tone: "warning", icon: "clamp", title: "Калибры", text: "опасная рабочая зона" }
    ],
    miniQuestion: {
      question: "Можно ли запускать станок при демонтированном кожухе?",
      options: ["нет", "да, если недолго", "да, если предупредить", "да, если нет вибрации"],
      answer: 0,
      feedback: "Кожухи должны быть установлены, иначе запуск запрещен."
    }
  },
  {
    id: "hl-working-stroke",
    number: "HL.5",
    title: "Режим «Рабочий ход»",
    lead: "При вальцовке используется рабочий ход, реверс запрещен.",
    badge: { label: "Режим", tone: "info" },
    visualType: "control-panel",
    cards: [
      { tone: "safe", icon: "check", title: "Рабочий ход", text: "нормальный режим вальцовки" },
      { tone: "danger", icon: "stop", title: "Реверс", text: "при вальцовке запрещен" },
      { tone: "warning", icon: "alert", title: "Застревание", text: "действовать по согласованию" }
    ],
    miniQuestion: {
      question: "Какой режим используется при вальцовке?",
      options: ["рабочий ход", "реверс", "любой режим", "режим очистки"],
      answer: 0,
      feedback: "При вальцовке используется режим «Рабочий ход»."
    }
  },
  {
    id: "hl-noise-vibration",
    number: "HL.6",
    title: "Шум, стук, вибрация",
    lead: "Отклонение в работе означает остановку станка.",
    badge: { label: "Стоп-сигнал", tone: "warning" },
    visualType: "algorithm",
    cards: [
      { tone: "warning", icon: "alert", title: "Шум / стук", text: "остановить станок" },
      { tone: "danger", icon: "stop", title: "Вибрация", text: "не продолжать" },
      { tone: "warning", icon: "bolt", title: "Изоляция / масло", text: "сообщить руководителю" },
      { tone: "safe", icon: "eye", title: "Безопасная сторона", text: "отойти после остановки" }
    ],
    miniQuestion: {
      question: "Что делать при появлении стука или вибрации?",
      options: ["остановить станок", "продолжить медленнее", "включить реверс", "держать образец руками"],
      answer: 0,
      feedback: "Стук и вибрация — причина остановить станок и сообщить руководителю."
    }
  }
];

const stHprtLearningScreens = [
  {
    id: "st-three-rolls",
    number: "ST.1",
    title: "Рабочая зона трех валков",
    lead: "Главный риск — валки и зона деформации.",
    badge: { label: "Высокий риск", tone: "danger" },
    visualType: "zone-map",
    cards: [
      { tone: "danger", icon: "rotate", title: "Три валка", text: "формируют рабочую зону" },
      { tone: "warning", icon: "alert", title: "Деформация", text: "образец проходит через валки" },
      { tone: "danger", icon: "stop", title: "Захват", text: "риск застревания и движения металла" }
    ],
    zones: ["Валок 1", "Валок 2", "Валок 3"],
    miniQuestion: {
      question: "Где находится основная опасная зона стана?",
      options: ["в зоне валков", "у входной двери", "у журнала", "у освещения"],
      answer: 0,
      feedback: "Основная опасность ST-ХПРТ находится в зоне трех валков."
    }
  },
  {
    id: "st-exit-line",
    number: "ST.2",
    title: "Линия выхода металла",
    lead: "На линии выхода находиться запрещено.",
    badge: { label: "Запретная зона", tone: "danger" },
    visualType: "zone-map",
    cards: [
      { tone: "warning", icon: "alert", title: "Выход образца", text: "металл выходит из валков" },
      { tone: "danger", icon: "stop", title: "Люди", text: "на линии выхода находиться нельзя" },
      { tone: "safe", icon: "clean", title: "Свободная зона", text: "путь выхода очищен" }
    ],
    zones: ["Валки", "Линия выхода", "Свободная зона"],
    miniQuestion: {
      question: "Можно ли находиться на линии выхода металла?",
      options: ["нет", "да, если далеко", "да, если предупредить", "да, на малой скорости"],
      answer: 0,
      feedback: "Линия выхода металла должна быть свободной от людей."
    }
  },
  {
    id: "st-start-warning",
    number: "ST.3",
    title: "Пульт и предупреждение перед запуском",
    lead: "Перед запуском оператор предупреждает остальных.",
    badge: { label: "Команда", tone: "info" },
    visualType: "control-panel",
    callout: "Внимание, запуск стана!",
    cards: [
      { tone: "required", icon: "user", title: "Оператор", text: "находится за пультом" },
      { tone: "warning", icon: "alert", title: "Предупредить", text: "громко сообщить о запуске" },
      { tone: "safe", icon: "eye", title: "Проверить", text: "людей нет в опасной зоне" }
    ],
    miniQuestion: {
      question: "Что должен сделать оператор перед запуском привода?",
      options: [
        "предупредить остальных и убедиться в готовности",
        "сразу включить привод",
        "подойти к линии выхода",
        "убрать кожухи"
      ],
      answer: 0,
      feedback: "Перед запуском оператор предупреждает сотрудников и проверяет опасные зоны."
    }
  },
  {
    id: "st-forbidden-manual",
    number: "ST.4",
    title: "Запрещенные ручные операции",
    lead: "Любые ручные операции выполняются только при выключенном приводе.",
    badge: { label: "Запрещено", tone: "danger" },
    visualType: "dont",
    cards: [
      { tone: "danger", icon: "wrench", title: "Регулировать валки", text: "при приводе нельзя" },
      { tone: "danger", icon: "eye", title: "Измерять образец", text: "только после остановки" },
      { tone: "danger", icon: "clean", title: "Наносить риски", text: "на ходу запрещено" },
      { tone: "danger", icon: "clamp", title: "Подтягивать крепления", text: "после отключения" }
    ],
    miniQuestion: {
      question: "Можно ли наносить риски на металл при включенном приводе?",
      options: ["нет", "да, если быстро", "да, если металл виден", "да, если оператор у пульта"],
      answer: 0,
      feedback: "Нанесение рисок и измерение выполняют только после остановки."
    }
  },
  {
    id: "st-stuck-sample",
    number: "ST.5",
    title: "Застревание образца",
    lead: "Извлечение выполняют только после остановки и проверки зоны.",
    badge: { label: "Алгоритм", tone: "warning" },
    visualType: "algorithm",
    cards: [
      { tone: "danger", icon: "stop", title: "Стоп", text: "остановить стан" },
      { tone: "safe", icon: "eye", title: "Проверить", text: "выходная сторона свободна" },
      { tone: "required", icon: "wrench", title: "Устранить", text: "только безопасным способом" },
      { tone: "warning", icon: "alert", title: "Не запускать", text: "до устранения причины" }
    ],
    miniQuestion: {
      question: "Что нужно проверить после остановки при застревании?",
      options: [
        "отсутствие людей на выходной стороне валков",
        "только состояние журнала",
        "только скорость вращения",
        "ничего не нужно"
      ],
      answer: 0,
      feedback: "После остановки проверяют выходную сторону валков и только затем устраняют причину."
    }
  },
  {
    id: "st-deviations",
    number: "ST.6",
    title: "Отклонения в работе",
    lead: "Стук, удары, скрежет или застревание означают отключение привода.",
    badge: { label: "Стоп-сигнал", tone: "warning" },
    visualType: "algorithm",
    cards: [
      { tone: "warning", icon: "alert", title: "Стук / удары", text: "не продолжать" },
      { tone: "danger", icon: "stop", title: "Скрежет", text: "отключить привод" },
      { tone: "warning", icon: "clamp", title: "Застревание", text: "выяснить причину" },
      { tone: "safe", icon: "shield", title: "Возврат", text: "только после устранения" }
    ],
    miniQuestion: {
      question: "Можно ли продолжать работу при скрежете или стуке?",
      options: ["нет", "да, если осталось немного", "да, на малой скорости", "да, если образец почти вышел"],
      answer: 0,
      feedback: "Скрежет, стук и удары требуют отключения привода и выяснения причины."
    }
  }
];

const euPpptTest = [
  {
    question: "Где основная опасная зона ЭУ-ПППТ?",
    options: ["в рабочей клети / зоне валков", "у входа в помещение", "у аптечки", "только у пульта"],
    answer: 0,
    explanation: "Основной риск связан с валками и зоной деформации."
  },
  {
    question: "Можно ли работать при снятом ограждении вращающегося узла?",
    options: ["нет", "да, если осторожно", "да, если узел виден", "да, при малой скорости"],
    answer: 0,
    explanation: "Вращающиеся элементы должны быть закрыты защитными ограждениями."
  },
  {
    question: "Зачем оператор находится у пульта?",
    options: ["контролировать процесс и остановить установку при отклонениях", "для удобства наблюдения", "чтобы стоять ближе к валкам", "это необязательно"],
    answer: 0,
    explanation: "Пульт — точка управления безопасностью процесса."
  },
  {
    question: "Где нельзя находиться во время прокатки?",
    options: ["на линии выхода металла и в межклетевом промежутке", "у стенда инструктажа", "у входа", "в бытовой зоне"],
    answer: 0,
    explanation: "Линия выхода и межклетевой промежуток являются запретными зонами."
  },
  {
    question: "Можно ли измерять образец при включенном приводе?",
    options: ["нет", "да, если быстро", "да, если есть помощник", "да, при малой скорости"],
    answer: 0,
    explanation: "Измерение и ручные операции выполняются только после остановки."
  },
  {
    question: "Первое действие при застревании образца?",
    options: ["остановить привод", "подойти к валкам", "включить скорость выше", "поправить образец руками"],
    answer: 0,
    explanation: "При застревании сначала останавливают привод."
  }
];

const hlTest = [
  {
    question: "С какой стороны подают образец на HL-6-14?",
    options: ["с рабочей стороны у тумблера режима", "с любой стороны", "с нерабочей стороны", "только сзади"],
    answer: 0,
    explanation: "Подача образца выполняется с рабочей стороны станка."
  },
  {
    question: "Можно ли пропускать калибры?",
    options: ["нет", "да", "да, если образец прочный", "да, при рабочем ходе"],
    answer: 0,
    explanation: "Калибры проходят последовательно."
  },
  {
    question: "Допускается ли образец длиной 80 мм?",
    options: ["нет", "да", "да, если без трещин", "да, при помощи второго сотрудника"],
    answer: 0,
    explanation: "Допустимая длина образца — 100–300 мм."
  },
  {
    question: "Можно ли запускать станок без кожуха?",
    options: ["нет", "да, если кожух мешает", "да, на короткое время", "да, при малой скорости"],
    answer: 0,
    explanation: "Работа без установленных кожухов запрещена."
  },
  {
    question: "Какой режим используется при вальцовке?",
    options: ["рабочий ход", "реверс", "любой", "останов"],
    answer: 0,
    explanation: "При вальцовке используется режим «Рабочий ход»."
  },
  {
    question: "Что делать при стуке или вибрации?",
    options: ["остановить станок", "продолжать медленнее", "включить реверс", "держать образец руками"],
    answer: 0,
    explanation: "Стук и вибрация являются стоп-сигналами."
  }
];

const stHprtTest = [
  {
    question: "Где основная опасная зона ST-ХПРТ?",
    options: ["в зоне валков", "у входа", "у журнала", "у освещения"],
    answer: 0,
    explanation: "Основная опасность связана с тремя валками и зоной деформации."
  },
  {
    question: "Можно ли находиться на линии выхода металла?",
    options: ["нет", "да, если далеко", "да, если предупредили", "да, при остановке пульта"],
    answer: 0,
    explanation: "Линия выхода металла должна быть свободна от людей."
  },
  {
    question: "Что оператор делает перед запуском привода?",
    options: ["предупреждает остальных и проверяет опасные зоны", "сразу включает привод", "подходит к валкам", "снимает кожух"],
    answer: 0,
    explanation: "Перед запуском оператор предупреждает сотрудников и убеждается в готовности."
  },
  {
    question: "Можно ли наносить риски при включенном приводе?",
    options: ["нет", "да, если быстро", "да, если рядом помощник", "да, при малой скорости"],
    answer: 0,
    explanation: "Ручные операции выполняются только после остановки и отключения."
  },
  {
    question: "Что проверить после остановки при застревании?",
    options: ["отсутствие людей на выходной стороне валков", "только номер ИОТ", "только состояние журнала", "ничего"],
    answer: 0,
    explanation: "Перед устранением причины проверяют выходную сторону валков."
  },
  {
    question: "Можно ли продолжать работу при скрежете или стуке?",
    options: ["нет", "да, если осталось немного", "да, на малой скорости", "да, если образец выходит"],
    answer: 0,
    explanation: "Скрежет, стук и удары требуют отключения привода и выяснения причины."
  }
];

const seamlessTubeModules = [
  {
    id: "iot-73-eu-pppt",
    equipmentId: "eu-pppt",
    instruction: "ИОТ-73",
    title: "ЭУ-ПППТ: продольная прокатка труб",
    passScore: 80,
    learningScreens: euPpptLearningScreens,
    test: [...seamlessCommonTest, ...euPpptTest]
  },
  {
    id: "iot-74-hl-6-14",
    equipmentId: "hl-6-14",
    instruction: "ИОТ-74",
    title: "Острильный станок HL-6-14",
    passScore: 80,
    learningScreens: hlLearningScreens,
    test: [...seamlessCommonTest, ...hlTest]
  },
  {
    id: "iot-80-st-hprt",
    equipmentId: "st-hprt",
    instruction: "ИОТ-80",
    title: "ST-ХПРТ: трехвалковый стан винтовой прокатки",
    passScore: 80,
    learningScreens: stHprtLearningScreens,
    test: [...seamlessCommonTest, ...stHprtTest]
  }
];

const trainingCatalog = [
  {
    id: "rusniti",
    name: "АО «РусНИТИ»",
    children: [
      {
        id: "anticorrosion-sector",
        type: "sector",
        name: "Сектор испытаний антикоррозионных и консервационных покрытий",
        equipment: [
          {
            id: "hitachi-b16rm",
            name: "Вертикально-сверлильный станок Hitachi B16RM",
            shortName: "Hitachi B16RM",
            instruction: "ИОТ-47",
            instructionTitle: "Инструкция по охране труда при работе на сверлильном станке",
            status: "ready",
            video: "assets/video/hitachi_b16rm_training.mp4",
            developer: "Бараков И.С.",
            safetyResponsible: "Разинькова А.В.",
            riskBadges: ["вращение", "стружка", "электричество", "закрепление детали", "СИЗ"]
          }
        ]
      },
      {
        id: "corrosion-sector",
        type: "sector",
        name: "Сектор коррозионных испытаний",
        equipment: []
      },
      {
        id: "mechanical-sector",
        type: "sector",
        name: "Сектор механических испытаний",
        equipment: []
      },
      {
        id: "chemistry-metallography-sector",
        type: "sector",
        name: "Сектор испытаний химического состава и металлографии",
        equipment: []
      }
    ]
  },
  {
    id: "ic-tmk",
    name: "ОП ООО «ИЦ ТМК»",
    children: [
      {
        id: "new-product-department",
        type: "department",
        name: "Отдел разработки новой продукции, сопутствующих технологий и материалов",
        equipment: []
      },
      {
        id: "seamless-pipe-department",
        type: "department",
        name: "Отдел бесшовных труб",
        sectionName: "Участок ЭИП ОМД",
        commonTrainingRequired: true,
        commonTrainingId: SEAMLESS_TUBES_COMMON_TRAINING_ID,
        commonTitle: "Общие требования охраны труда",
        commonSubtitle: "Правила, обязательные для всех установок отдела бесшовных труб",
        commonBlocks: seamlessTubeCommonBlocks,
        equipment: seamlessTubeEquipment
      },
      {
        id: "heat-treatment-lab",
        type: "laboratory",
        name: "Лаборатория термической обработки",
        equipment: []
      },
      {
        id: "chemical-tech-sector",
        type: "sector",
        name: "Сектор химико-технологических испытаний",
        equipment: []
      },
      {
        id: "welding-center",
        type: "center",
        name: "Центр сварочных технологий",
        equipment: []
      }
    ]
  }
];

window.trainingCatalog = trainingCatalog;

window.SafetyData = {
  project: {
    title: "Цифровой контур безопасности научного кластера",
    subtitle: "Интерактивное обучение и контроль знаний по охране труда",
    shortName: "Сохранение безопасной работы сотрудников научного кластера",
    timeline: [
      "Подготовка цифровых инструктажей и перечня оборудования",
      "Проектирование и разработка web-приложения",
      "Подготовка интерактивных материалов для подразделений",
      "Пилотное внедрение и сбор обратной связи",
      "Масштабирование и ввод в промышленную эксплуатацию",
      "Оценка эффективности и подготовка к промышленному запуску"
    ]
  },

  trainingCatalog,

  email: {
    to: "razinkova.av@example.com",
    responsibleName: "Разинькова А.В.",
    subject: "Пройдено обучение по ИОТ-47 — Hitachi B16RM"
  },

  modules: [
    {
      id: "iot-47-hitachi-b16rm",
      equipmentId: "hitachi-b16rm",
      instruction: "ИОТ-47",
      title: "Работа на вертикально-сверлильном станке Hitachi B16RM",
      passScore: 80,
      learningBlocks: [
        {
          id: "hazard-map",
          title: "Карта опасных зон",
          visualType: "hazard-map",
          riskLevel: "Высокий",
          riskClass: "high",
          lead: "Сначала найди зоны, где ошибка быстро становится травмой.",
          points: [
            "Патрон и сверло захватывают одежду и предметы.",
            "Стружка летит в лицо и на руки.",
            "Деталь должна быть закреплена до пуска.",
            "Электрика проверяется до работы."
          ],
          visual: {
            markers: [
              { label: "Патрон", note: "захват одежды и рук", icon: "rotate", x: 52, y: 18 },
              { label: "Сверло", note: "стружка и поломка", icon: "chips", x: 50, y: 36 },
              { label: "Стружка", note: "зона отлета частиц", icon: "chips", x: 67, y: 43 },
              { label: "Деталь", note: "закрепление до пуска", icon: "clamp", x: 46, y: 58 },
              { label: "Питание", note: "кабель и заземление", icon: "bolt", x: 74, y: 74 }
            ],
            tabs: [
              { label: "Вращение", title: "Держи дистанцию", text: "Руки, одежда и ключи не должны попадать в зону патрона." },
              { label: "Стружка", title: "Защити глаза", text: "Очки или щиток обязательны до начала сверления." },
              { label: "Крепление", title: "Фиксация до пуска", text: "Деталь удерживают тиски или приспособление, не руки." }
            ]
          }
        },
        {
          id: "admission-checklist",
          title: "Допуск к работе",
          visualType: "checklist",
          riskLevel: "Средний",
          riskClass: "medium",
          lead: "К станку подходит только подготовленный сотрудник.",
          points: [
            "Обучение и инструктаж пройдены.",
            "СИЗ надеты и исправны.",
            "Рабочее место проверено.",
            "Станок осмотрен.",
            "Деталь закреплена."
          ],
          visual: {
            items: [
              { title: "Обучение", text: "допуск подтвержден", icon: "check" },
              { title: "СИЗ", text: "надеты и исправны", icon: "shield" },
              { title: "Рабочее место", text: "проходы свободны", icon: "eye" },
              { title: "Станок", text: "осмотрен до пуска", icon: "wrench" },
              { title: "Деталь", text: "закреплена", icon: "clamp" }
            ],
            accordion: [
              { title: "Если допуска нет", text: "Самостоятельно работать на станке нельзя." },
              { title: "Если есть сомнения", text: "Остановись и уточни допуск у руководителя." }
            ]
          }
        },
        {
          id: "ppe-cards",
          title: "СИЗ перед пуском",
          visualType: "ppe",
          riskLevel: "Средний",
          riskClass: "medium",
          lead: "СИЗ работают только когда они исправны и правильно надеты.",
          points: [
            "Надеть спецодежду и спецобувь.",
            "Использовать очки или щиток.",
            "Застегнуть манжеты.",
            "Поврежденные СИЗ заменить."
          ],
          visual: {
            cards: [
              { icon: "eye", title: "Глаза", text: "очки или щиток", details: "Надеть до подхода к станку." },
              { icon: "suit", title: "Одежда", text: "без свободных концов", details: "Манжеты застегнуть, края убрать." },
              { icon: "shoe", title: "Обувь", text: "устойчивая спецобувь", details: "Подошва не скользит." },
              { icon: "shield", title: "Состояние", text: "без повреждений", details: "Порванные СИЗ заменить." }
            ],
            tabs: [
              { label: "Глаза", title: "Стружка непредсказуема", text: "Защиту глаз надевают до приближения к станку." },
              { label: "Одежда", title: "Свободные элементы убрать", text: "Манжеты застегнуты, шнуры и края не свисают." }
            ]
          }
        },
        {
          id: "machine-check",
          title: "Проверка станка",
          visualType: "inspection",
          riskLevel: "Высокий",
          riskClass: "high",
          lead: "Станок проверяют до сверления и без нагрузки.",
          points: [
            "Холостой ход без вибрации.",
            "Органы управления работают.",
            "Пуск и остановка штатные.",
            "Электропитание без повреждений.",
            "Заземление подключено."
          ],
          visual: {
            checks: [
              { title: "Холостой ход", status: "без биения", icon: "rotate" },
              { title: "Управление", status: "кнопки и подача", icon: "wrench" },
              { title: "Пуск / стоп", status: "штатная остановка", icon: "stop" },
              { title: "Питание", status: "кабель целый", icon: "bolt" },
              { title: "Провода", status: "нет оголения", icon: "alert" },
              { title: "Заземление", status: "контакт есть", icon: "shield" }
            ],
            accordion: [
              { title: "Стоп-сигнал", text: "Оголенный провод, запах гари, вибрация или повреждение корпуса." },
              { title: "Действие", text: "Не включать станок и сообщить руководителю." }
            ]
          },
          miniQuestion: {
            question: "Что проверить перед началом работы?",
            options: [
              "только наличие заготовки",
              "СИЗ, рабочее место, станок, крепление и проходы",
              "только номер инструкции",
              "только скорость вращения"
            ],
            answer: 1,
            feedback: "Перед пуском проверяют СИЗ, место, станок, инструмент, крепление и проходы."
          }
        },
        {
          id: "part-fixing",
          title: "Закрепление детали",
          visualType: "compare",
          riskLevel: "Высокий",
          riskClass: "high",
          lead: "Руки не заменяют тиски или приспособление.",
          points: [
            "Сверло закреплено в патроне.",
            "Деталь зафиксирована до пуска.",
            "Ключ убран из патрона.",
            "При провороте станок остановлен."
          ],
          visual: {
            good: ["деталь зажата", "ключ убран", "центр накернен", "руки вне зоны"],
            bad: ["держат рукой", "ключ в патроне", "крепят на ходу", "деталь гуляет"],
            tabs: [
              { label: "Правильно", title: "Фиксируй до пуска", text: "Заготовка, тиски и инструмент закреплены до включения." },
              { label: "Неправильно", title: "Руки в зоне риска", text: "Удерживание рукой может закончиться проворотом детали." }
            ]
          },
          miniQuestion: {
            question: "Можно ли удерживать деталь руками?",
            options: [
              "да, если деталь небольшая",
              "нет, деталь закрепляют в тисках или приспособлении",
              "да, если надеты перчатки",
              "да, если сверлить медленно"
            ],
            answer: 1,
            feedback: "Деталь удерживать руками нельзя: при провороте станок останавливают и крепление исправляют."
          }
        },
        {
          id: "safe-drilling",
          title: "Безопасное сверление",
          visualType: "drilling",
          riskLevel: "Средний",
          riskClass: "medium",
          lead: "Сверление идет плавно: подготовка, подача, контроль.",
          points: [
            "Центр отверстия накернен.",
            "Деталь и сверло закреплены.",
            "Подача плавная, без рывков.",
            "На выходе сверла подача снижена.",
            "Станок постоянно под контролем."
          ],
          visual: {
            steps: [
              { title: "Кернение", text: "центр отверстия", icon: "check" },
              { title: "Закрепление", text: "деталь и сверло", icon: "clamp" },
              { title: "Плавная подача", text: "без рывков", icon: "rotate" },
              { title: "Выход сверла", text: "уменьшить подачу", icon: "alert" },
              { title: "Контроль", text: "звук и вибрация", icon: "eye" }
            ],
            accordion: [
              { title: "Если появилась вибрация", text: "Остановить вращение и проверить крепление детали и сверла." }
            ]
          },
          miniQuestion: {
            question: "Что делать при вибрации?",
            options: [
              "увеличить подачу",
              "остановить станок и проверить крепление сверла и детали",
              "удерживать деталь рукой",
              "продолжить работу"
            ],
            answer: 1,
            feedback: "Вибрация требует остановки и проверки крепления детали, инструмента и режима."
          }
        },
        {
          id: "forbidden-actions",
          title: "Запрещено",
          visualType: "forbidden",
          riskLevel: "Критический",
          riskClass: "critical",
          lead: "Эти действия нельзя выполнять даже на малых оборотах.",
          points: [
            "Не удерживать деталь руками.",
            "Не тормозить патрон руками.",
            "Не крепить инструмент на ходу.",
            "Не отходить от работающего станка.",
            "Не работать с неисправностью."
          ],
          visual: {
            cards: [
              { title: "Деталь руками", text: "только тиски", icon: "stop" },
              { title: "Патрон руками", text: "только штатный стоп", icon: "rotate" },
              { title: "Крепление на ходу", text: "сначала остановка", icon: "wrench" },
              { title: "Уход от станка", text: "работа под наблюдением", icon: "eye" },
              { title: "Неисправность", text: "работа запрещена", icon: "alert" }
            ]
          },
          miniQuestion: {
            question: "Можно ли тормозить патрон руками?",
            options: [
              "нет, только штатной остановкой",
              "да, если патрон почти остановился",
              "да, если использовать ткань",
              "да, если рядом никого нет"
            ],
            answer: 0,
            feedback: "Патрон и сверло останавливают только штатным управлением станка."
          }
        },
        {
          id: "emergency-situations",
          title: "Аварийные сценарии",
          visualType: "scenarios",
          riskLevel: "Критический",
          riskClass: "critical",
          lead: "При аварии сначала останови источник опасности.",
          points: [
            "Пожар: стоп, 101 или 112.",
            "Ток: отключить питание.",
            "Вибрация: проверить крепление.",
            "Травма: первая помощь и 103.",
            "Неисправность: сообщить руководителю."
          ],
          visual: {
            scenarios: [
              { title: "Пожар", action: "стоп / 101 / 112", icon: "fire" },
              { title: "Поражение током", action: "обесточить", icon: "bolt" },
              { title: "Вибрация", action: "крепление и инструмент", icon: "alert" },
              { title: "Поломка", action: "дождаться остановки", icon: "stop" },
              { title: "Травма", action: "первая помощь / 103", icon: "shield" },
              { title: "Неисправность", action: "не продолжать", icon: "wrench" }
            ],
            tabs: [
              { label: "101 / 112", title: "Пожар", text: "Остановить работу, вызвать пожарную охрану, сообщить руководству." },
              { label: "103", title: "Травма", text: "Помощь пострадавшему и вызов скорой при необходимости." }
            ]
          },
          miniQuestion: {
            question: "Что делать при признаках пожара?",
            options: [
              "продолжить операцию",
              "остановить работу, по возможности отключить питание и вызвать 101 или 112",
              "накрыть станок спецодеждой",
              "ждать окончания смены"
            ],
            answer: 1,
            feedback: "При пожаре работу прекращают, вызывают 101 или 112 и сообщают руководству."
          }
        },
        {
          id: "emergency-algorithm",
          title: "Алгоритм аварии",
          visualType: "algorithm",
          riskLevel: "Высокий",
          riskClass: "high",
          lead: "Действуй коротко и по порядку.",
          points: [
            "Остановить работу.",
            "Отключить оборудование.",
            "Сообщить руководителю.",
            "Оказать первую помощь.",
            "Вызвать службы."
          ],
          visual: {
            layout: "vertical",
            steps: [
              { title: "Стоп", text: "остановить работу", icon: "stop" },
              { title: "Отключить", text: "обесточить станок", icon: "bolt" },
              { title: "Сообщить", text: "руководителю", icon: "shield" },
              { title: "Первая помощь", text: "без риска для себя", icon: "check" },
              { title: "Вызвать службы", text: "101 / 112 / 103", icon: "fire" },
              { title: "Сохранить обстановку", text: "если нет угрозы", icon: "eye" }
            ],
            accordion: [
              { title: "Главное правило", text: "Помощь не должна создавать новую опасность." },
              { title: "После аварии", text: "Сохрани обстановку, если это безопасно." }
            ]
          },
          miniQuestion: {
            question: "Кому сообщить о неисправности?",
            options: [
              "непосредственному руководителю или ответственному лицу",
              "только коллегам в конце смены",
              "никому, если работа почти закончена",
              "только после теста"
            ],
            answer: 0,
            feedback: "О неисправности сообщают руководителю или ответственному лицу до продолжения работы."
          }
        },
        {
          id: "finish-work",
          title: "Завершение работы",
          visualType: "finish",
          riskLevel: "Низкий",
          riskClass: "low",
          lead: "Финал работы: отключить, убрать, сообщить.",
          points: [
            "Питание отключено.",
            "Заготовки убраны.",
            "Инструмент убран.",
            "Стружка удалена, место чистое.",
            "Недостатки переданы руководителю."
          ],
          visual: {
            items: [
              { title: "Питание отключено", icon: "bolt" },
              { title: "Заготовки убраны", icon: "clamp" },
              { title: "Инструмент убран", icon: "wrench" },
              { title: "Стружка удалена", icon: "chips" },
              { title: "Место чистое", icon: "clean" },
              { title: "Недостатки переданы", icon: "shield" }
            ],
            accordion: [
              { title: "Почему это важно", text: "Следующий сотрудник получает безопасное рабочее место." }
            ]
          }
        }
      ],
      test: [
        {
          question: "Кто может быть допущен к работе на станке Hitachi B16RM?",
          options: [
            "любой сотрудник подразделения",
            "сотрудник после обучения, стажировки, проверки знаний и допуска",
            "сотрудник, который ранее видел работу станка",
            "сотрудник без инструктажа, если операция короткая"
          ],
          answer: 1,
          explanation: "Самостоятельная работа возможна только после подготовки, инструктажей, проверки знаний и допуска."
        },
        {
          question: "Какая группа по электробезопасности требуется работнику?",
          options: ["I группа", "II группа", "III группа", "группа не требуется"],
          answer: 0,
          explanation: "В инструкции указана необходимость I группы по электробезопасности."
        },
        {
          question: "Что относится к основным опасным факторам при сверлении?",
          options: [
            "вращающиеся части, стружка, шум, вибрация и электрическое напряжение",
            "только шум от станка",
            "только бумажная документация",
            "только высокая температура воздуха"
          ],
          answer: 0,
          explanation: "Опасности включают вращение, стружку, вибрацию, электрические риски и пожарные факторы."
        },
        {
          question: "Какие СИЗ необходимы перед началом работы?",
          options: [
            "спецодежда, спецобувь, защитные очки или лицевой щиток",
            "только халат без застегнутых манжет",
            "перчатки для работы у вращающегося инструмента",
            "личная одежда без СИЗ"
          ],
          answer: 0,
          explanation: "Перед работой применяют положенные СИЗ, а спецодежду застегивают без свисающих концов."
        },
        {
          question: "Что делать при обнаружении неисправности оборудования до начала работы?",
          options: [
            "начать работу на малых оборотах",
            "сообщить руководителю и не приступать до устранения",
            "закрыть неисправность кожухом",
            "использовать станок только для одной операции"
          ],
          answer: 1,
          explanation: "Работа до устранения неисправностей и нарушений требований охраны труда запрещена."
        },
        {
          question: "Как должна быть закреплена обрабатываемая деталь?",
          options: [
            "достаточно удерживать рукой",
            "надежно и правильно, чтобы исключить вылет или проворот",
            "можно не закреплять при тонкой детали",
            "можно закрепить после запуска станка"
          ],
          answer: 1,
          explanation: "Деталь, тиски и приспособления закрепляют надежно до начала обработки."
        },
        {
          question: "Как нужно подавать сверло к детали?",
          options: [
            "плавно, без усилий и рывков",
            "резко, чтобы быстрее пройти металл",
            "с одновременным торможением патрона рукой",
            "только после снятия защитных очков"
          ],
          answer: 0,
          explanation: "Плавная подача снижает риск заклинивания, поломки инструмента и травмы."
        },
        {
          question: "Какое действие запрещено во время работы станка?",
          options: [
            "держать голову на безопасном расстоянии",
            "тормозить патрон и сверло руками",
            "уменьшить подачу при выходе сверла",
            "следить за работой оборудования"
          ],
          answer: 1,
          explanation: "Патрон и сверло нельзя тормозить руками, как и поправлять деталь на ходу."
        },
        {
          question: "Что делать при признаках пожара или горения?",
          options: [
            "продолжить работу до конца операции",
            "прекратить работу, по возможности отключить электрооборудование, вызвать 101 или 112 и сообщить руководству",
            "накрыть станок спецодеждой",
            "открыть все двери и ждать"
          ],
          answer: 1,
          explanation: "При пожаре работу прекращают, отключают энергию при возможности, вызывают пожарную охрану и сообщают руководству."
        },
        {
          question: "Что нужно сделать после окончания работы?",
          options: [
            "отключить питание, убрать инструмент, очистить станок и сообщить о недостатках",
            "оставить станок включенным для следующего работника",
            "убрать стружку руками до остановки станка",
            "ничего не делать, если операция прошла без замечаний"
          ],
          answer: 0,
          explanation: "Завершение работы включает отключение, уборку, гигиену и информирование руководителя о выявленных недостатках."
        }
      ]
    },
    ...seamlessTubeModules
  ]
};
