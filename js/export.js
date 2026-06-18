(function () {
  function csvCell(value) {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  }

  function exportJournalCSV(results) {
    const headers = [
      "Дата",
      "ФИО",
      "Табельный номер",
      "Должность",
      "E-mail",
      "Организация",
      "Подразделение",
      "Установка",
      "Инструкция",
      "Результат",
      "Статус",
      "ID сертификата"
    ];

    const rows = results.map((item) => [
      window.SafetyCertificate.formatDate(item.date),
      item.employeeName,
      item.tabNumber,
      item.position,
      item.email,
      item.organization,
      item.department,
      item.installation || item.equipment,
      item.instruction,
      `${item.score}/${item.total} (${item.percent}%)`,
      item.passed ? "Зачтено" : "Не зачтено",
      item.certificateId || ""
    ]);

    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `journal_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function buildMailto(result) {
    const settings = window.SafetyData.email;
    const score = `${result.score}/${result.total} (${result.percent}%)`;
    const body = [
      "Добрый день.",
      "",
      "Сообщаем о прохождении обучения по охране труда:",
      "",
      `ФИО: ${result.employeeName}`,
      `Табельный номер: ${result.tabNumber || "не указан"}`,
      `Должность: ${result.position || "не указана"}`,
      `E-mail сотрудника: ${result.email || "не указан"}`,
      `Организация: ${result.organization}`,
      `Подразделение: ${result.department}`,
      `Оборудование: ${result.installation || result.equipment}`,
      `Инструкция: ${result.instruction}`,
      `Дата: ${window.SafetyCertificate.formatDate(result.date)}`,
      `Результат: ${score}`,
      `ID сертификата: ${result.certificateId || "не сформирован"}`,
      "",
      "Сообщение сформировано прототипом web-приложения."
    ].join("\n");

    return `mailto:${settings.to}?subject=${encodeURIComponent(settings.subject)}&body=${encodeURIComponent(body)}`;
  }

  function sendResultToOT(result) {
    console.info("Google Apps Script integration placeholder", result);
    return Promise.resolve({
      ok: false,
      message:
        "sendResultToOT() подготовлена для будущей интеграции с Google Apps Script. Сейчас используется mailto."
    });
  }

  window.SafetyExport = {
    exportJournalCSV,
    buildMailto,
    sendResultToOT
  };

  window.sendResultToOT = sendResultToOT;
})();
