export const addMonths = (date: Date, months: number) => {
  const d = date.getDate();
  date.setMonth(date.getMonth() + months);
  if (date.getDate() !== d) {
    date.setDate(0);
  }

  return date;
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
};

export const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
