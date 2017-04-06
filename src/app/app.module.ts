import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";

import {AppComponent} from "./app.component";
import {NavBarComponent} from "./navbar/navbar.component";
import {AuthService} from "./service/auth.service";
import {AppRoutingModule} from "./app-routing.module";
import {DashboardComponent} from "./worker/dashboard.component";
import {ReportComponent} from "./admin/report/report.component";
import {HomeComponent} from "./home/home.component";
import {TimeService} from "./service/time.service";
import {WorkInfoService} from "./service/work-info.service";
import {DatePipe} from "@angular/common";
import {
  ButtonModule,
  CalendarModule,
  DialogModule,
  DropdownModule,
  InputMaskModule,
  InputTextareaModule,
  InputTextModule,
  SelectButtonModule,
  SharedModule
} from "primeng/primeng";
import {Ng2Webstorage} from "ng2-webstorage";
import {DownloadService} from "./service/download.service";
import {LoginComponent} from "./login/login.component";
import {AuthGuardService} from "./service/auth-guard.service";

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    DashboardComponent,
    HomeComponent,
    ReportComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    DialogModule,
    SharedModule,
    ButtonModule,
    CalendarModule,
    SelectButtonModule,
    InputTextModule,
    InputMaskModule,
    DropdownModule,
    InputTextareaModule,
    Ng2Webstorage
  ],
  providers: [
    AuthService,
    TimeService,
    WorkInfoService,
    DatePipe,
    DownloadService,
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
