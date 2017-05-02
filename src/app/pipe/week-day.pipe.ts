import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'weekDay'})
export class WeekDayPipe implements PipeTransform {
  transform(date: string, ...args: any[]): string {
    let weekDay = new Date(date).getDay();
    let day: string;
    switch (weekDay) {
      case 0:
        day = "א";
        break;
      case 1:
        day = "ב";
        break;
      case 2:
        day = "ג";
        break;
      case 3:
        day = "ד";
        break;
      case 4:
        day = "ה";
        break;
      case 5:
        day = "ו";
        break;
      case 6:
        day = "ש";
    }
    return day;
  }
}
