import {Component, OnDestroy, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {Subscription} from "rxjs/Subscription";
import {Credentials} from "../model/credentials";
import {Router} from "@angular/router";
import {SessionStorageService} from "ng2-webstorage";
import {Employee} from "../model/employee";
import {Message} from 'primeng/primeng';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy{
  isRegistered: boolean;
  token: string;
  error: string;
  msgs: Message[] = [];
  credentials: Credentials;
  private jwtSubscription: Subscription;
  LOGO = require("../../assets/logo-naya.gif");
  private authTokenSubscription: Subscription;
  private profile: Employee;
  private authSubscription: Subscription;
  private isFirstTime: boolean;

  constructor(private authService: AuthService, private localSt: SessionStorageService, private router: Router) {
    this.credentials = new Credentials();
  }

  showSuccess(msg: string) {
    this.msgs = [];
    this.msgs.push({severity:'success', summary:'הצלחה', detail:msg});
  }

  showError(msg: string) {
    this.msgs = [];
    this.msgs.push({severity:'error', summary:'שגיאה', detail:msg});
  }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.authTokenSubscription = this.authService.tokenObserv().subscribe(token => this.token = token);
    this.authSubscription = this.authService.profileObserv().subscribe(employee => {
      this.profile = JSON.parse(employee);
    });
  }

  login() {
    this.jwtSubscription = this.authService.login(this.credentials)
      .subscribe(jwt => {
          this.isFirstTime = true;
          this.localSt.store("TOKEN", jwt.token);
          this.localSt.store('lastRegistrationCheck', jwt.lastRegistrationCheck);
          this.authService.storeProfile();
          this.error = '';
          let redirect = this.authService.redirectUrl && this.authService.redirectUrl != '/app/admin' ? this.authService.redirectUrl : '/app/dashboard';
          this.router.navigate([redirect]);
          jQuery('#checkingSign').delay(2000).fadeOut(500);
        },
        err => {
          this.error = err;
        });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) this.authSubscription.unsubscribe();
    if (this.jwtSubscription) this.jwtSubscription.unsubscribe();
    if (this.authTokenSubscription) this.authTokenSubscription.unsubscribe();
  }

  generateNewPass() {
    let mail = this.credentials.email;
    if (!mail || mail.length==0) {
      this.showError('נא הזן אימייל תקני אליו יישלח מייל עם הסיסמא החדשה');
    } else {
      this.authService.generateNewPass(mail).subscribe(res => {
        this.showSuccess('סיסמתך החדשה נשלחה אליך במייל');
      }, err => {
        this.showError('כתובת הדוא"ל לא תקנית');
      });
    }

  }
}
