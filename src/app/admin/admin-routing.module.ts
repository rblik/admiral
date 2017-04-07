import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ReportComponent} from "./report/report.component";
import {AdminAuthGuardService} from "../service/admin-auth-guard.service";

const routes: Routes = [
  {
    path: 'reports',
    component: ReportComponent,
    canActivate: [AdminAuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}




