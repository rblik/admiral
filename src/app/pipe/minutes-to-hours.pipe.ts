import {Pipe, PipeTransform} from "@angular/core";
@Pipe({name: 'minutesToHours'})
export class MinutesToHoursPipe implements PipeTransform {
  transform(minutes: number, short?: boolean): string {
    let mm: number = Math.ceil(minutes / 5) * 5;
    let h = Math.floor(mm/60);
    let m: number = mm % 60;
    return !short? h + " ש' " + ((m==0)? "" : (m != 0) ? m + " דק'" : "") : h + " ש' " + ((m==0)? "" : (m != 0) ? m + " דק'" : "");
  }
}
