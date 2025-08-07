export function getDateRangeArray(start: Date, end: Date) {
  const arr: Date[] = [];
  let dt = new Date(start);

  const today = new Date();

  const addDay = () => {
    if (dt > today) {
      return;
    }
    arr.push(new Date(dt));
    dt = new Date(dt.setDate(dt.getDate() + 1));
  };
  while (true) {
    addDay();
    if (dt > end) {
      addDay();
      break;
    }
  }
  arr.reverse();
  return arr;
}
