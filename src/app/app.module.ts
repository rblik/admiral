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
import {CommonModule, DatePipe} from "@angular/common";
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
  SharedModule,
  ScheduleModule,
  OverlayPanelModule,
  DataGridModule,
  PanelModule,
  SpinnerModule, GrowlModule
} from "primeng/primeng";
import {Ng2Webstorage} from "ng2-webstorage";
import {AuthGuardService} from "./service/auth-guard.service";
import {AdminAuthGuardService} from "./service/admin-auth-guard.service";
import {MyCommonModule} from "./my-common.module";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import {NotificationBarModule} from "angular2-notification-bar";
import {SlimLoadingBarModule} from "ng2-slim-loading-bar";
import {MonthInfoService} from "./service/month-info.service";
import {UserDownloadService} from "./service/user-download.service";
import {PasswordStrengthBarModule} from "ng2-password-strength-bar";
import {PassrefreshComponent} from "./passrefresh/passrefresh.component";
import {AuthGuardTokenOnlyService} from "./service/auth-guard-token-only-service";
import {FrontalMessageService} from "./service/frontalmessage.service";
import {ColorPickerModule} from 'angular2-color-picker/lib/color-picker.module';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    DashboardComponent,
    HomeComponent,
    PassrefreshComponent
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
    OverlayPanelModule,
    InputTextModule,
    InputMaskModule,
    DropdownModule,
    ColorPickerModule,
    InputTextareaModule,
    Ng2Webstorage,
    MyCommonModule,
    CommonModule,
    PasswordStrengthBarModule,
    DataGridModule,
    PanelModule,
    SpinnerModule,
    CheckboxModule,
    ScheduleModule,
    GrowlModule,
    MultiselectDropdownModule,
    NotificationBarModule,
    SlimLoadingBarModule.forRoot()
  ],
  providers: [
    FrontalMessageService,
    AuthService,
    TimeService,
    WorkInfoService,
    MonthInfoService,
    DatePipe,
    AuthGuardService,
    AdminAuthGuardService,
    AuthGuardTokenOnlyService,
    UserDownloadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
