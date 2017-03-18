import {Component, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {Worker} from "../model/worker";

@Component({
  selector: 'worker-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  private worker: Worker;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.worker = this.authService.getLoggedWorker();
  }

}
