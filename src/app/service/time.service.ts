import {Injectable} from "@angular/core";

@Injectable()
export class TimeService {
  getWeekDay(offset?: number) {
    let d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    let day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -7 + offset : offset);
    return new Date(d.setDate(diff));
  }

  getRelativeWeekDay(date1: Date, offset: number){
    let date = new Date(date1.getTime());
    let day = date.getDay(),
      diff = date.getDate() + offset;
    return new Date(date.setDate(diff));
  }

}
