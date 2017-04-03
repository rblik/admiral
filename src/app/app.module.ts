import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
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
  SharedModule, DialogModule,
  ButtonModule, CalendarModule,
  InputTextModule, InputMaskModule,
  DropdownModule, InputTextareaModule
} from 'primeng/primeng';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    DashboardComponent,
    HomeComponent,
    ReportComponent
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
    InputTextModule,
    InputMaskModule,
    DropdownModule,
    InputTextareaModule
  ],
  providers: [
    AuthService,
    TimeService,
    WorkInfoService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
