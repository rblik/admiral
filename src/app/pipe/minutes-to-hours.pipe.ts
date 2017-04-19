import {Pipe, PipeTransform} from "@angular/core";
@Pipe({name: 'minutesToHours'})
export class MinutesToHoursPipe implements PipeTransform {
  transform(minutes: number, ...args: any[]): string {
    let h = Math.floor(minutes/60);
    let m: number = minutes % 60;
    return h + "h. " + ((m==0)? "" : (m != 0) ? m + "min." : "");
  }
}
