# Цифровой контур безопасности научного кластера

Статическое web-приложение для обучения сотрудников по охране труда: идентификация, карточный выбор организации, подразделения и установки, видео, интерактивные обучающие блоки, итоговый тест, сертификат, уведомление по ОТ и служебный журнал в `localStorage`.

## 1. Как запустить приложение

Откройте `index.html` в браузере. Backend и сборка не требуются.

Для проверки через локальный сервер:

```bash
python -m http.server 8080
```

Затем откройте `http://localhost:8080`.

## 2. Как добавить новое оборудование

В `js/data.js` добавьте объект установки в массив `equipment` нужного подразделения внутри `trainingCatalog`.

```js
{
  id: "new-equipment",
  name: "Название установки",
  shortName: "Краткое название",
  instruction: "ИОТ-XX",
  instructionTitle: "Название инструкции",
  status: "ready",
  video: "assets/video/new_equipment_training.mp4",
  developer: "Фамилия И.О.",
  safetyResponsible: "Разинькова А.В.",
  riskBadges: ["риск 1", "риск 2"]
}
```

Пример размещения:

```js
{
  id: "anticorrosion-sector",
  type: "sector",
  name: "Сектор испытаний антикоррозионных и консервационных покрытий",
  equipment: [
    { id: "hitachi-b16rm", name: "Вертикально-сверлильный станок Hitachi B16RM", ... },
    { id: "new-equipment", name: "Название установки", ... }
  ]
}
```

## 3. Как добавить новую инструкцию

В `js/data.js` добавьте новый объект в массив `modules`.

Укажите:

- `equipmentId` — ID установки;
- `instruction` — номер инструкции;
- `title` — название модуля;
- `passScore` — проходной процент;
- `learningBlocks` — визуальные обучающие экраны;
- `test` — 10 итоговых вопросов с пояснениями.

Для обучающих экранов используйте готовые типы `visualType`: `hazard-map`, `checklist`, `ppe`, `inspection`, `compare`, `forbidden`, `scenarios`, `algorithm`, `finish`.

## 4. Как заменить видео

Поместите файл:

```text
assets/video/hitachi_b16rm_training.mp4
```

Или поменяйте путь у оборудования:

```js
video: "assets/video/hitachi_b16rm_training.mp4"
```

Если файла нет, приложение показывает заглушку и позволяет продолжить демонстрационное прохождение.

## 5. Как изменить e-mail по ОТ

В `js/data.js` измените блок:

```js
email: {
  to: "razinkova.av@example.com",
  responsibleName: "Разинькова А.В.",
  subject: "Пройдено обучение по ИОТ-47 — Hitachi B16RM"
}
```

Кнопка «Отправить уведомление по ОТ» формирует `mailto` после успешного теста.

## 6. Как подключить Google Apps Script

В `js/export.js` оставлена заготовка:

```js
function sendResultToOT(result) {
  console.info("Google Apps Script integration placeholder", result);
}
```

Подключение:

1. Создайте Google Apps Script с Web App endpoint.
2. В `sendResultToOT(result)` добавьте `fetch("URL_WEB_APP", { method: "POST", body: JSON.stringify(result) })`.
3. В Apps Script примите JSON и запишите данные в Google Sheets.
4. После проверки можно заменить `mailto` на вызов `sendResultToOT(result)`.

## 7. Как выгрузить журнал

На главной странице нажмите маленькую служебную ссылку внизу, затем в журнале нажмите «Экспорт CSV».

В CSV попадают дата, ФИО, табельный номер, должность, e-mail, организация, подразделение, установка, инструкция, результат, статус и ID сертификата.

## 8. Как опубликовать на GitHub Pages

1. Создайте репозиторий на GitHub.
2. Загрузите файлы проекта.
3. Откройте `Settings -> Pages`.
4. В `Build and deployment` выберите `Deploy from a branch`.
5. Укажите ветку `main` и папку `/root`.
6. Сохраните настройки и дождитесь публикации.

Приложение не использует backend, поэтому работает на GitHub Pages без дополнительных настроек.
