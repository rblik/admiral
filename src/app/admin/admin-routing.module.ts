import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ReportComponent} from "./report/report.component";
import {AdminAuthGuardService} from "../service/admin-auth-guard.service";
import {MissingDaysComponent} from "./missing/missing-days.component";

const routes: Routes = [
  {
    path: 'reports',
    component: ReportComponent,
    canActivate: [AdminAuthGuardService],
    canActivateChild: [AdminAuthGuardService],
    children: [
      {
        path: 'missing',
        component: MissingDaysComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}




