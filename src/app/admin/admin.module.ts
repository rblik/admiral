import {NgModule} from "@angular/core";
import {MissingDaysComponent} from "./missing/missing-days.component";
import {ReportComponent} from "./report/report.component";
import {AdminRoutingModule} from "./admin-routing.module";
import {
  CalendarModule, DialogModule, DropdownModule, InputMaskModule, SelectButtonModule,
  SharedModule
} from "primeng/primeng";
import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {DownloadService} from "./service/download.service";
import {ReportService} from "./service/report.service";
import {EmployeeService} from "./service/employee.service";

@NgModule({
  declarations: [
    MissingDaysComponent,
    ReportComponent
  ],
  imports: [
    AdminRoutingModule,
    CommonModule,
    SelectButtonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    DialogModule,
    SharedModule,
    CalendarModule,
    InputMaskModule,
    DropdownModule
  ],
  providers: [
    DownloadService,
    ReportService,
    EmployeeService
  ]
})
export class AdminModule {

}
