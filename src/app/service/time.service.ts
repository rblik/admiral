import {Injectable} from "@angular/core";

@Injectable()
export class TimeService {
  getWeekDay(offset?: number) {
    let d = new Date();
    let day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -7 + offset : offset);
    return new Date(d.setDate(diff));
  }

}
