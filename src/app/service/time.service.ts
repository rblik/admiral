import {Injectable} from "@angular/core";
import {DateFormatPipe} from "../pipe/date-format.pipe";

@Injectable()
export class TimeService {

  public fromDate: Date;
  public toDate: Date;

  constructor(private datepipe: DateFormatPipe) {
  }

  setDefaultDateRange(offset: number) {
    this.fromDate = this.getFirstDayOfMonth(offset);
    this.toDate = this.getFirstDayOfNextMonth(offset);
  }

  public getDateString(date: Date): string {
    return this.datepipe.transform(date, 'yyyy-MM-dd');
  }

  public getWeekDay(offset?: number): Date {
    let d = new Date();
    d.setUTCHours(0, 0, 0);
    let day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -7 + offset : offset);
    return new Date(d.setDate(diff));
  }

  public getRelativeWeekDay(date1: Date, offset: number): Date {
    let date = new Date(date1.getTime());
    let diff = date.getDate() + offset;
    return new Date(date.setDate(diff));
  }

  public getFirstDayOfMonth(offset: number): Date {
    let d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + offset, 1);
  }

  public getFirstDayOfNextMonth(offset: number): Date {
    let d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + offset + 1, 1);
  }

  public getTime(timeStr: string): any {
    let dt = new Date();

    let time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
    if (!time) {
      return NaN;
    }
    let hours = parseInt(time[1], 10);

    dt.setHours(hours);
    dt.setMinutes(parseInt(time[2], 10) || 0);
    dt.setSeconds(0, 0);
    return dt;
  }

  public getTimeDiff(timeStr1: string, timeStr2: string) {
    return (this.getTime(timeStr1).getTime() - this.getTime(timeStr2).getTime()) / (3600 * 1000);
  }
}
