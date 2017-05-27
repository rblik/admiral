import {NgModule} from "@angular/core";
import {MinutesToHoursPipe} from "./pipe/minutes-to-hours.pipe";
import {HebrewDatePipe} from "./pipe/hebrew-date.pipe";
import {DateFormatPipe} from "./pipe/date-format.pipe";
import {WeekDayPipe} from "./pipe/week-day.pipe";
import {TimePipe} from "./pipe/time.pipe";
import {CurrencyPipe} from "./pipe/currency.pipe";
import {TariffTypePipe} from "./pipe/tariff-type.pipe";
import {OnlyNumberDirective} from "./directives/only-number.directive";
import {ReversePipe} from "./pipe/reverse.pipe";
@NgModule({
  declarations: [
    MinutesToHoursPipe,
    HebrewDatePipe,
    DateFormatPipe,
    WeekDayPipe,
    TimePipe,
    CurrencyPipe,
    TariffTypePipe,
    OnlyNumberDirective,
    ReversePipe
  ],
  exports: [
    MinutesToHoursPipe,
    HebrewDatePipe,
    DateFormatPipe,
    WeekDayPipe,
    TimePipe,
    CurrencyPipe,
    TariffTypePipe,
    ReversePipe
  ],
  providers: [DateFormatPipe]
})
export class MyCommonModule {

}
