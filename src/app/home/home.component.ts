import {Component, OnDestroy, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {Subscription} from "rxjs/Subscription";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy{
  isRegistered: boolean;
  token: string;
  LOGO = require("../../assets/logo-naya.gif");
  private authTokenSubscription: Subscription;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.authTokenSubscription = this.authService.tokenObserv().subscribe(token => this.token = token);
  }

  ngOnDestroy(): void {
    if (this.authTokenSubscription) this.authTokenSubscription.unsubscribe();
  }
}
