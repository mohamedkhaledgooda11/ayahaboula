/**
 * Strict Arabic Cairo Time Formatter
 * Format: [اسم اليوم]، [اليوم بالأرقام] [اسم الشهر بالعربية] [السنة] - [الساعة 12]:[الدقيقة] [ص/م]
 * مثال: الخميس، 20 أغسطس 2026 - 10:30 م
 */

const arabicDays = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

const arabicMonths = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];

export function formatArabicCairoDate(inputDate?: Date | string | number): string {
  const date = inputDate ? new Date(inputDate) : new Date();

  // Convert to Africa/Cairo TimeZone
  const cairoString = date.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
  const cairoDate = new Date(cairoString);

  const dayName = arabicDays[cairoDate.getDay()];
  const dayNumber = cairoDate.getDate();
  const monthName = arabicMonths[cairoDate.getMonth()];
  const year = cairoDate.getFullYear();

  let hours = cairoDate.getHours();
  const minutes = cairoDate.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'م' : 'ص';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = hours.toString();

  return `${dayName}، ${dayNumber} ${monthName} ${year} - ${formattedHours}:${minutes} ${period}`;
}

export function formatArabicCairoDateNow(): string {
  return formatArabicCairoDate(new Date());
}

export function generateOrderCode(): string {
  const prefix = 'AYA';
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${random}`;
}
