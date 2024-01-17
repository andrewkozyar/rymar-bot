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

export const getDaysDifference = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(
    getDateWithoutHours(date2).getTime() - getDateWithoutHours(date1).getTime(),
  );
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getDateWithoutHours = (date: Date) => {
  const time = date.getTime();
  const milisec = time % 86400000;

  return new Date(time - milisec);
};
