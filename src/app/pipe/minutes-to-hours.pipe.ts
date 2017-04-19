import {Pipe, PipeTransform} from "@angular/core";
@Pipe({name: 'minutesToHours'})
export class MinutesToHoursPipe implements PipeTransform {
  transform(minutes: number, ...args: any[]): string {
    let mm: number = Math.ceil(minutes / 5) * 5;
    let h = Math.floor(mm/60);
    let m: number = mm % 60;
    return h + "h. " + ((m==0)? "" : (m != 0) ? m + "min." : "");
  }
}
