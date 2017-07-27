import {Injectable} from "@angular/core";
import {DateFormatPipe} from "../pipe/date-format.pipe";
import {WorkInfo} from "../model/work-info";

@Injectable()
export class TimeService {

  public fromDate: Date;
  public toDate: Date;
  private static MS_PER_DAY = 1000 * 60 * 60 * 24;

  constructor(private datepipe: DateFormatPipe) {
  }

  setDefaultDateRange(offset: number) {
    this.fromDate = this.getFirstDayOfMonth(offset);
    this.toDate = this.getFirstDayOfMonth(offset + 1);
  }

  public getDateString(date: Date): string {
    return date == null ? null : this.datepipe.transform(date, 'yyyy-MM-dd');
  }

  public getWeekDay(offset?: number): Date {
    let d = new Date();
    d.setUTCHours(0, 0, 0);
    let day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -7 + offset : offset);
    return new Date(d.setDate(diff));
  }

  public getWeekDayByDate(date : Date, offset?: number): Date {
    let d = new Date(date);
    d.setUTCHours(0, 0, 0);
    let day = d.getDay(),
      diff = d.getDate() - day + offset;
    return new Date(d.setDate(diff));
  }

  public getDayOffset(fromDate: Date, toDate: Date): number {
    let fromDateSunday = this.getWeekDayByDate(fromDate, 0);
    let toDateSunday = this.getWeekDayByDate(toDate, 0);
    let utcFrom = Date.UTC(fromDateSunday.getFullYear(), fromDateSunday.getMonth(), fromDateSunday.getDate());
    let utcTo = Date.UTC(toDateSunday.getFullYear(), toDateSunday.getMonth(), toDateSunday.getDate());

    return Math.round((utcTo - utcFrom) / (TimeService.MS_PER_DAY));
  }

  public getDaysInMonth(monthOffset?: number) {
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1 + monthOffset, 0).getDate();
  }

  public getRelativeMonthDay(date1: Date, offset: number): Date {
    let date = new Date(date1.getTime());
    let diff = date.getDate() + offset;
    return new Date(date.setDate(diff));
  }

  public getFirstDayOfMonth(offset: number): Date {
    let d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + offset, 1);
  }

  public getMonthOffset(date: Date): number {
    let d1: Date = new Date();
    let months;
    months = (date.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += date.getMonth();
    return months;
  }

  public validate(workInfo: WorkInfo): boolean {
    if (!workInfo.from || !workInfo.to) {
      return true;
    }
      let fromH = workInfo.from.substr(0, 2);
      let fromM = workInfo.from.substr(3, 2);
      let toH = workInfo.to.substr(0, 2);
      let toM = workInfo.to.substr(3, 2);
      return parseInt(fromH) > 23
            || parseInt(fromM) > 59
            || parseInt(toH) > 23
            || parseInt(toM) > 59
            || workInfo.from > workInfo.to;
  }
}
