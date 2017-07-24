import {OnInit, Component, OnDestroy} from "@angular/core";
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
  private passwordChangeSuccess: any;
  private passwordChangeFailure: any;
  private passwordUpdateSubscrption: Subscription;
  private requstStarted: boolean;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.profile = this.authService.getProfile();
    this.authSubscription = this.authService.profileObserv().subscribe(employee => {
      this.profile = JSON.parse(employee);
    });
  }

  preparePasswordForm() {
    this.passwordChangeSuccess = null;
    this.passwordChangeFailure = null;
  }

  ngOnDestroy(): void {
    if (this.authSubscription) this.authSubscription.unsubscribe();
    if (this.passwordUpdateSubscrption) this.passwordUpdateSubscrption.unsubscribe();
  }

  updatePassword(newPass: string){
    if (!!newPass) {
      if (newPass != '') {
        this.requstStarted = true;
        this.passwordUpdateSubscrption = this.authService.changeOwnPass(newPass).subscribe(response => {
          this.requstStarted = false;
          this.passwordChangeSuccess = 'הסיסמה עודכנה בהצלחה';
        }, e=> {
          this.passwordChangeFailure = e;
        });
      }
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
