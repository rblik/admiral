import {Pipe, PipeTransform} from "@angular/core";
@Pipe({name: 'minutesToHours'})
export class MinutesToHoursPipe implements PipeTransform {
  transform(minutes: number, short?: boolean): string {
    let h = Math.floor(minutes/60);
    let m: number = minutes % 60;
    return !short? h + " ש' " + ((m==0)? "" : (m != 0) ? m + " דק'" : "") : h + " ש' " + ((m==0)? "" : (m != 0) ? m + " דק'" : "");
  }
}
