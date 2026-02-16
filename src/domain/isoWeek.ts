export function getIsoWeekInfo(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = utcDate.getUTCFullYear();

  const monday = new Date(utcDate);
  monday.setUTCDate(utcDate.getUTCDate() - ((utcDate.getUTCDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    year,
    week,
    isoWeekKey: `${year}-W${String(week).padStart(2, '0')}`,
    dateFrom: monday.toISOString().slice(0, 10),
    dateTo: sunday.toISOString().slice(0, 10)
  };
}

export function getIsoWeekInfoWeeksAgo(weeksAgo: number, baseDate = new Date()) {
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() - (weeksAgo * 7));
  return getIsoWeekInfo(targetDate);
}
