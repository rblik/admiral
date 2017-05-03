import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'tariffType'})
export class TariffTypePipe implements PipeTransform {
  transform(tariff: string, ...args: any[]): string {
    let type;
    switch (tariff) {
      case 'HOUR':
        type = 'לשעה';
        break;
      case 'DAY':
        type = 'ליום';
        break;
      case 'MONTH':
        type = 'לחודש';
        break;
      case 'FIX':
        type = 'פיקס';
        break;
      default:
        type = '';
    }
    return type;
  }
}
