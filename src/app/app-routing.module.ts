import {Routes, RouterModule} from "@angular/router";
import {DashboardComponent} from "./worker/dashboard.component";
import {NgModule} from "@angular/core";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {
    path: 'app/dashboard',
    component: DashboardComponent
  },
  {
    path: 'app',
    component: HomeComponent
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
