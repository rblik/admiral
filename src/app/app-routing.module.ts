import {Routes, RouterModule} from "@angular/router";
import {DashboardComponent} from "./worker/dashboard.component";
import {NgModule} from "@angular/core";
import {HomeComponent} from "./home/home.component";
import {ReportComponent} from "./admin/report/report.component";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
  {
    path: 'app/login',
    component: LoginComponent
  },
  {
    path: 'app/dashboard',
    component: DashboardComponent
  },
  {
    path: 'app',
    component: HomeComponent
  },
  {
    path: 'app/admin/reports',
    component: ReportComponent
  },
  {
    path: '',
    redirectTo: '/app',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
