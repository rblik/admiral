import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'hebrewDate'})
export class HebrewDatePipe implements PipeTransform {
  transform(date: Date, short?: boolean): any {
    if (date!=null) {
      let year: number = date.getFullYear();
      let dayOfMonth: number = date.getDate();
      let day: string;
      switch (date.getDay()) {
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
      let month: string;
      switch (date.getMonth()) {
        case 0:
          month = "ינואר";
          break;
        case 1:
          month = "פברואר";
          break;
        case 2:
          month = "מרץ";
          break;
        case 3:
          month = "אפריל";
          break;
        case 4:
          month = "מאי";
          break;
        case 5:
          month = "יוני";
          break;
        case 6:
          month = "יולי";
          break;
        case 7:
          month = "אוגוסט";
          break;
        case 8:
          month = "ספטמבר";
          break;
        case 9:
          month = "אוקטובר";
          break;
        case 10:
          month = "נובמבר";
          break;
        case 11:
          month = "דצמבר";
          break;
      }
      return !short? year+ " " + month+ " " + dayOfMonth+" " + day : dayOfMonth+" " + day;
    }

  }
}
