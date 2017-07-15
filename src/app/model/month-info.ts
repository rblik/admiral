export class MonthInfo {

  constructor(year: number, month: number, locked: boolean, hoursSum: number) {
    this.year = year;
    this.month = month;
    this.locked = locked;
    this.hoursSum = hoursSum;
  }

  id: number;
  year: number;
  month: number;
  locked: boolean;
  hoursSum: number;
}
