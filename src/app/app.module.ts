import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";

import {AppComponent} from "./app.component";
import {NavBarComponent} from "./navbar/navbar.component";
import {AuthService} from "./service/auth.service";
import {AppRoutingModule} from "./app-routing.module";
import {DashboardComponent} from "./worker/dashboard.component";
import {HomeComponent} from "./home/home.component";
import {TimeService} from "./service/time.service";
import {WorkInfoService} from "./service/work-info.service";
import {DatePipe} from "@angular/common";
import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DialogModule,
  DropdownModule,
  InputMaskModule,
  InputTextareaModule,
  InputTextModule,
  SelectButtonModule,
  SharedModule
} from "primeng/primeng";
import {Ng2Webstorage} from "ng2-webstorage";
import {LoginComponent} from "./login/login.component";
import {AuthGuardService} from "./service/auth-guard.service";
import {AdminAuthGuardService} from "./service/admin-auth-guard.service";
import {DateFormatPipe} from "./pipe/date-format.pipe";
import {MyCommonModule} from "./my-common.module";
import {ReversePipe} from "./pipe/reverse.pipe";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import {HebrewDatePipe} from "./pipe/hebrew-date.pipe";


@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    DashboardComponent,
    HomeComponent,
    LoginComponent,
    ReversePipe,
    HebrewDatePipe
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
    Ng2Webstorage,
    MyCommonModule,
    CheckboxModule,
    MultiselectDropdownModule
  ],
  providers: [
    AuthService,
    TimeService,
    WorkInfoService,
    DatePipe,
    AuthGuardService,
    AdminAuthGuardService,
    DateFormatPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
