// Prices are Saudi riyals. Arabic shows "1,299 ر.س" and English "SAR 1,299",
// both with Western digits as on Saudi online stores; halalas appear only when present.
export function formatCurrency(amount, locale) {
  const lang = (locale || document.documentElement.lang || 'ar').startsWith('ar') ? 'ar' : 'en';
  const value = Number(amount || 0);
  const number = new Intl.NumberFormat(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  return lang === 'ar' ? `${number} ر.س` : `SAR ${number}`;
}

export function formatDate(value, locale, options = { dateStyle: 'medium' }) {
  if (!value) return '';
  const lang = (locale || document.documentElement.lang || 'ar').startsWith('ar') ? 'ar' : 'en';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB', options).format(new Date(value));
}
