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
import {MyCommonModule} from "./my-common.module";
import {ReversePipe} from "./pipe/reverse.pipe";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import {NotificationBarModule} from "angular2-notification-bar";
import {SlimLoadingBarModule} from "ng2-slim-loading-bar";
import {LockService} from "./service/lock.service";

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    DashboardComponent,
    HomeComponent,
    LoginComponent,
    ReversePipe
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
    MultiselectDropdownModule,
    NotificationBarModule,
    SlimLoadingBarModule.forRoot()
  ],
  providers: [
    AuthService,
    TimeService,
    WorkInfoService,
    LockService,
    DatePipe,
    AuthGuardService,
    AdminAuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
