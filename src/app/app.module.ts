import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {NavBarComponent} from "./navbar/navbar.component";
import {MockService} from "./service/mock-service";
import {AuthService} from "./service/auth.service";
import {AppRoutingModule} from "./app-routing.module";
import {DashboardComponent} from "./worker/dashboard.component";
import {HomeComponent} from "./home/home.component";
import {DialogModule, ScheduleModule, CalendarModule, ToggleButtonModule} from "primeng/primeng";

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    DashboardComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ScheduleModule,
    DialogModule,
    CalendarModule,
    ToggleButtonModule
  ],
  providers: [
    MockService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
