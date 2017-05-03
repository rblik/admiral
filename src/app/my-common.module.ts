import {NgModule} from "@angular/core";
import {MinutesToHoursPipe} from "./pipe/minutes-to-hours.pipe";
import {AbsenceTypePipe} from "./pipe/absence-type.pipe";
import {HebrewDatePipe} from "./pipe/hebrew-date.pipe";
import {DateFormatPipe} from "./pipe/date-format.pipe";
import {WeekDayPipe} from "./pipe/week-day.pipe";
import {TimePipe} from "./pipe/time.pipe";
import {CurrencyPipe} from "./pipe/currency.pipe";
import {TariffTypePipe} from "./pipe/tariff-type.pipe";
@NgModule({
  declarations: [
    MinutesToHoursPipe,
    AbsenceTypePipe,
    HebrewDatePipe,
    DateFormatPipe,
    WeekDayPipe,
    TimePipe,
    CurrencyPipe,
    TariffTypePipe
  ],
  exports: [
    MinutesToHoursPipe,
    AbsenceTypePipe,
    HebrewDatePipe,
    DateFormatPipe,
    WeekDayPipe,
    TimePipe,
    CurrencyPipe,
    TariffTypePipe
  ],
  providers: [DateFormatPipe]
})
export class MyCommonModule {

}
