export function formatCurrency(amount, locale) {
  try {
    const current = locale || document.documentElement.lang || 'en';
    const baseLocale = current === 'ar' ? 'ar-SA' : 'en-US';
    const formatter = new Intl.NumberFormat(baseLocale, {
      style: 'currency',
      currency: 'SAR',
      currencyDisplay: 'symbol'
    });
    const formatted = formatter.format(Number(amount || 0));
    // Normalize to ﷼ symbol if a different SAR label is used
    return formatted.replace(/SAR|ر\.س\.?/i, '﷼');
  } catch {
    return `﷼${Number(amount || 0).toFixed(2)}`;
  }
}

