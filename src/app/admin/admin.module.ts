import {NgModule} from "@angular/core";
import {MissingDaysComponent} from "./missing/missing-days.component";
import {ReportComponent} from "./report/report.component";
import {AdminRoutingModule} from "./admin-routing.module";
import {
  CalendarModule, CheckboxModule, DataTableModule, DialogModule, DropdownModule, InputMaskModule, OverlayPanelModule,
  SelectButtonModule,
  SharedModule, SpinnerModule
} from "primeng/primeng";
import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {DownloadService} from "./service/download.service";
import {ReportService} from "./service/report.service";
import {EmployeeService} from "./service/employee.service";
import {PartialDaysComponent} from "./partial/partial-days.component";
import {PivotalComponent} from "./pivotal/pivotal.component";
import {AgreementService} from "./service/agreement.service";
import {AdminClientsComponent} from "./clients/admin-clients.component";
import {ProjectService} from "./service/project.service";
import {ClientService} from "./service/client.service";
import {ClientDetailComponent} from "./client-detail/client-detail.component";
import {AdminEmployeesComponent} from "./employees/admin-employees.component";
import {EmployeeDetailComponent} from "./employee-detail/employee-detail.component";
import {DepartmentService} from "./service/department.service";
import {EmployeeFormComponent} from "./employee-form/employee-form.component";
import {ClientFormComponent} from "./client-form/client-form.component";
import {DepartmentFormComponent} from "./department-form/department-form.component";
import {MyCommonModule} from "../my-common.module";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import {MailService} from "./service/mail.service";
import {NotificationBarModule} from "angular2-notification-bar";
import {ProjectEmployeeFormComponent} from "./project-employee-form/project-employee-form.component";
import {AdminDashboardHeaderComponent} from "./dashboard/header/admin-dashboard-header.component";
import {AdminDashboardComponent} from "./dashboard/admin-dashboard.component";
import {AdminLockService} from "./service/admin-lock.service";
import {IncomeComponent} from "./income/income.component";

@NgModule({
  declarations: [
    ReportComponent,
    MissingDaysComponent,
    PartialDaysComponent,
    PivotalComponent,
    AdminClientsComponent,
    ClientDetailComponent,
    AdminEmployeesComponent,
    EmployeeDetailComponent,
    EmployeeFormComponent,
    ClientFormComponent,
    ProjectEmployeeFormComponent,
    AdminDashboardHeaderComponent,
    AdminDashboardComponent,
    DepartmentFormComponent,
    IncomeComponent
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
    DropdownModule,
    DataTableModule,
    SpinnerModule,
    CheckboxModule,
    MyCommonModule,
    MultiselectDropdownModule,
    NotificationBarModule,
    OverlayPanelModule
  ],
  providers: [
    DownloadService,
    ReportService,
    EmployeeService,
    AgreementService,
    ProjectService,
    ClientService,
    DepartmentService,
    MailService,
    AdminLockService
  ]
})
export class AdminModule {

}
