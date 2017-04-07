import {NgModule} from "@angular/core";
import {ClientsComponent} from "./client/clients.component";
import {ReportComponent} from "./report/report.component";
import {AdminRoutingModule} from "./admin-routing.module";
import {CalendarModule, DialogModule, InputMaskModule, SelectButtonModule, SharedModule} from "primeng/primeng";
import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [
    ClientsComponent,
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
    InputMaskModule
  ],
  providers: []
})
export class AdminModule {

}
