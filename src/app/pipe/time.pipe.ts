import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
  transform(time: string, ...args: any[]): string {
    return time.substr(0, 5);
  }
}
