import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ReportComponent} from "./report/report.component";
import {AdminAuthGuardService} from "../service/admin-auth-guard.service";
import {MissingDaysComponent} from "./missing/missing-days.component";
import {PartialDaysComponent} from "./partial/partial-days.component";
import {PivotalComponent} from "./pivotal/pivotal.component";
import {AdminClientsComponent} from "./clients/admin-clients.component";
import {ClientDetailComponent} from "./client-detail/client-detail.component";

const routes: Routes = [
  {
    path: 'reports',
    component: ReportComponent,
    canActivate: [AdminAuthGuardService],
    canActivateChild: [AdminAuthGuardService],
    children: [
      {
        path: 'partial',
        component: PartialDaysComponent
      },
      {
        path: 'missing',
        component: MissingDaysComponent
      },
      {
        path: 'pivotal',
        component: PivotalComponent
      }
    ]
  },
  {
    path: 'clients',
    component: AdminClientsComponent,
    canActivate: [AdminAuthGuardService],
    canActivateChild: [AdminAuthGuardService],
    children: [
      {
        path: ':clientId',
        component: ClientDetailComponent
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




