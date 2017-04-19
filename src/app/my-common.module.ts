import {NgModule} from "@angular/core";
import {MinutesToHoursPipe} from "./pipe/minutes-to-hours.pipe";
@NgModule({
  declarations: [MinutesToHoursPipe],
  exports: [MinutesToHoursPipe]
})
export class MyCommonModule {

}
