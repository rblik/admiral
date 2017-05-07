import {OnInit, Component, OnDestroy} from "@angular/core";
import {SessionStorageService} from "ng2-webstorage";
import {AuthService} from "../service/auth.service";
import {Employee} from "../model/employee";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'main-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  profile: Employee;
  LOGO = require("../../assets/logo-naya-little.gif");
  private authSubscription: Subscription;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.profile = this.authService.getProfile();
    this.authSubscription = this.authService.profileObserv().subscribe(employee => {
      this.profile = JSON.parse(employee);
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) this.authSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }
}
