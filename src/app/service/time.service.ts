import {Injectable} from "@angular/core";
import {DatePipe} from "@angular/common";

@Injectable()
export class TimeService {

  constructor(private datepipe: DatePipe) {
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
    return (this.getTime(timeStr1).getTime() - this.getTime(timeStr2).getTime())/(3600*1000);
  }
}
