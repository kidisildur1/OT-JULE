(function () {
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    const date = value ? new Date(value) : new Date();
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  }

  function generateCertificateId(moduleId) {
    const date = new Date();
    const stamp = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0")
    ].join("");
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    const prefix = moduleId === "iot-47-hitachi-b16rm" ? "IOT47" : "SAFE";
    return `${prefix}-${stamp}-${random}`;
  }

  function field(label, value) {
    return `
      <div class="certificate-field">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value || "—")}</strong>
      </div>
    `;
  }

  function buildCertificateHTML(result) {
    const score = `${result.score}/${result.total} (${result.percent}%)`;
    const installation = result.installation || result.equipment;

    return `
      <article class="certificate-sheet" id="certificateSheet">
        <div class="certificate-frame">
          <div class="certificate-topline">
            <span>${escapeHtml(result.organization || "АО «РусНИТИ»")}</span>
            <span>${escapeHtml(result.instruction || "ИОТ-47")}</span>
          </div>

          <div class="certificate-title">
            <span>Сертификат</span>
            <h1>о прохождении обучения по охране труда</h1>
            <p>Цифровой контур безопасности научного кластера</p>
          </div>

          <div class="certificate-person">
            <span>Настоящим подтверждается, что сотрудник</span>
            <strong>${escapeHtml(result.employeeName)}</strong>
            <span>успешно прошел итоговый контроль знаний по безопасной работе на установке</span>
          </div>

          <div class="certificate-grid">
            ${field("ФИО", result.employeeName)}
            ${field("Табельный номер", result.tabNumber)}
            ${field("Должность", result.position)}
            ${field("Организация", result.organization)}
            ${field("Подразделение", result.department)}
            ${field("Установка", installation)}
            ${field("Номер инструкции", result.instruction)}
            ${field("Дата прохождения", formatDate(result.date))}
            ${field("Результат теста", score)}
            ${field("ID сертификата", result.certificateId)}
          </div>

          <div class="certificate-signatures">
            <div>
              <span>Разработчик модуля</span>
              <strong>Бараков И.С.</strong>
            </div>
            <div>
              <span>Ответственная по ОТ</span>
              <strong>Разинькова А.В.</strong>
            </div>
          </div>

          <div class="certificate-footer">
            <span>Статус: зачтено</span>
            <span>${escapeHtml(result.certificateId)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function printCertificate() {
    document.body.classList.add("printing-certificate");
    window.print();
    window.setTimeout(() => document.body.classList.remove("printing-certificate"), 500);
  }

  window.SafetyCertificate = {
    generateCertificateId,
    buildCertificateHTML,
    printCertificate,
    formatDate
  };
})();
