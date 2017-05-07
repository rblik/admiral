import {Component, OnDestroy} from "@angular/core";
import {Credentials} from "../model/credentials";
import {AuthService} from "../service/auth.service";
import {SessionStorageService} from "ng2-webstorage";
import {Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
@Component({
  selector: 'login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy{
  ngOnDestroy(): void {
    if (this.jwtSubscription) this.jwtSubscription.unsubscribe();
  }
  error: string;
  credentials: Credentials;
  private jwtSubscription: Subscription;

  constructor(private authService: AuthService, private localSt: SessionStorageService, private router: Router) {
    this.credentials = new Credentials();
  }

  login() {
    this.jwtSubscription = this.authService.login(this.credentials)
      .subscribe(jwt => {
          this.localSt.store("TOKEN", jwt.token);
          this.authService.storeProfile();
          this.error = '';
          let redirect = this.authService.redirectUrl && this.authService.redirectUrl != '/app/admin' ? this.authService.redirectUrl : '/app';
          this.router.navigate([redirect]);
        },
        err => {
          this.error = err;
        });
  }
}
