import {Pipe, PipeTransform} from "@angular/core";
@Pipe({name: 'dateFormatPipe'})
export class DateFormatPipe implements PipeTransform {
  transform(date: Date, ...args: any[]): string {
    let local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  }
}
