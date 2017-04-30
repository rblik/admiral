import {NgModule} from "@angular/core";
import {MinutesToHoursPipe} from "./pipe/minutes-to-hours.pipe";
import {AbsenceTypePipe} from "./pipe/absence-type.pipe";
@NgModule({
  declarations: [MinutesToHoursPipe, AbsenceTypePipe],
  exports: [MinutesToHoursPipe, AbsenceTypePipe]
})
export class MyCommonModule {

}
