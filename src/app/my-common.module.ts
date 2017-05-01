import {NgModule} from "@angular/core";
import {MinutesToHoursPipe} from "./pipe/minutes-to-hours.pipe";
import {AbsenceTypePipe} from "./pipe/absence-type.pipe";
import {HebrewDatePipe} from "./pipe/hebrew-date.pipe";
import {DateFormatPipe} from "./pipe/date-format.pipe";
@NgModule({
  declarations: [MinutesToHoursPipe, AbsenceTypePipe, HebrewDatePipe, DateFormatPipe],
  exports: [MinutesToHoursPipe, AbsenceTypePipe, HebrewDatePipe, DateFormatPipe],
  providers: [DateFormatPipe]
})
export class MyCommonModule {

}
