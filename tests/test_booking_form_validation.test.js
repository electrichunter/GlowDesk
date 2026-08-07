/**
 * Test Module: Appointment Booking Form Validation
 * Tests phone formatting, TR mobile phone validation regex, full name 2-word requirement.
 */

function formatPhoneNumber(input) {
  let raw = input.replace(/\D/g, "");
  if (raw.length > 0) {
    if (!raw.startsWith("0") && raw.startsWith("5")) {
      raw = "0" + raw;
    }
    raw = raw.slice(0, 11);
    let formatted = raw;
    if (raw.length > 4 && raw.length <= 7) {
      formatted = `${raw.slice(0, 4)} ${raw.slice(4)}`;
    } else if (raw.length > 7 && raw.length <= 9) {
      formatted = `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
    } else if (raw.length > 9) {
      formatted = `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7, 9)} ${raw.slice(9)}`;
    }
    return formatted;
  }
  return "";
}

function isPhoneValid(p) {
  const digits = p.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("05");
}

function isFullNameValid(name) {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  return trimmed.length >= 3 && parts.length >= 2 && parts.every((p) => p.length >= 2);
}

function runBookingFormValidationTests() {
  const results = [];

  function assert(title, condition, detail = "") {
    results.push({
      suite: "Booking Form Validation",
      title,
      passed: Boolean(condition),
      detail: condition ? "Başarılı" : detail
    });
  }

  // 1. Phone Auto-Formatter Tests
  const phoneFormattingCases = [
    { input: "5551234567", expected: "0555 123 45 67" },
    { input: "05321112233", expected: "0532 111 22 33" },
    { input: "05449998877123", expected: "0544 999 88 77" }
  ];

  phoneFormattingCases.forEach((tc) => {
    const formatted = formatPhoneNumber(tc.input);
    assert(
      `Telefon Otomatik Biçimlendirme (${tc.input} -> ${tc.expected})`,
      formatted === tc.expected,
      `Beklenen: ${tc.expected}, Alınan: ${formatted}`
    );
  });

  // 2. Phone Validity Tests (After Auto-Formatter)
  const phoneValidationCases = [
    { rawInput: "0555 123 45 67", isValid: true },
    { rawInput: "0532 999 88 77", isValid: true },
    { rawInput: "0212 444 00 00", isValid: false }, // Landline start 02
    { rawInput: "12345", isValid: false },           // Too short
    { rawInput: "abc5551234567", isValid: true }     // Formatter cleans to 0555 123 45 67
  ];

  phoneValidationCases.forEach((tc) => {
    const formatted = formatPhoneNumber(tc.rawInput);
    const valid = isPhoneValid(formatted);
    assert(
      `Telefon TR GSM Format Doğrulaması ("${tc.rawInput}" -> "${formatted}")`,
      valid === tc.isValid,
      `Telefon geçerlilik durumu yanlış değerlendirildi: ${valid}`
    );
  });

  // 3. Full Name Validity Tests
  const nameValidationCases = [
    { name: "Ömer Faruk Uysal", isValid: true },
    { name: "Ayşe Yılmaz", isValid: true },
    { name: "Ahmet", isValid: false },            // Only 1 word
    { name: "  ", isValid: false },               // Whitespace
    { name: "A B", isValid: false }               // Single letter parts
  ];

  nameValidationCases.forEach((tc) => {
    const valid = isFullNameValid(tc.name);
    assert(
      `Ad Soyad Zorunluluk Doğrulaması ("${tc.name}")`,
      valid === tc.isValid,
      `Ad soyad geçerlilik sonucu yanlış: ${valid}`
    );
  });

  // 4. Combined Form Submission Readiness
  const formReadinessCases = [
    { name: "Zeynep Çelik", phone: "0536 444 55 66", shouldSubmit: true },
    { name: "Zeynep", phone: "0536 444 55 66", shouldSubmit: false },
    { name: "Zeynep Çelik", phone: "12345", shouldSubmit: false }
  ];

  formReadinessCases.forEach((tc) => {
    const formatted = formatPhoneNumber(tc.phone);
    const ready = isFullNameValid(tc.name) && isPhoneValid(formatted);
    assert(
      `Form Hazırlık & Gönderim Kilidi ("${tc.name}" | ${tc.phone})`,
      ready === tc.shouldSubmit,
      `Form gönderim kilidi hatalı çalıştı. Ready: ${ready}`
    );
  });

  return results;
}

module.exports = { runBookingFormValidationTests };
