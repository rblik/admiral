import {Pipe, PipeTransform} from "@angular/core";
@Pipe({name: 'currencyPipe'})
export class CurrencyPipe implements PipeTransform {
  transform(currency: string, ...args: any[]): string {
    let type;
    switch (currency) {
      case 'SHEKEL':
        type = 'ש"ח';
        break;
      case 'DOLLAR':
        type = 'דולר';
        break;
      case 'EURO':
        type = 'יורו';
        break;
      default:
        type = '';
    }
    return type;
  }
}
