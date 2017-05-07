import {Component, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit{
  isRegistered: boolean;
  token: string;
  LOGO = require("../../assets/logo-naya.gif");

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.authService.tokenObserv().subscribe(token => this.token = token)
  }

}
