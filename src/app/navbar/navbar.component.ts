import {OnInit, Component, OnDestroy} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {Employee} from "../model/employee";
import {Subscription} from "rxjs/Subscription";
import {MonthlyStandard} from "../model/monthly-standard";
import {MonthInfoService} from "../service/month-info.service";
import {Router} from "@angular/router";

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
  private standarts: MonthlyStandard[] = [];
  private isEditedStandard: number;
  private numberForEditing: number;
  private currYear: number;
  private standartsUi: MonthlyStandard[] = new Array(12);
  private account: string;
  private newPassword: string;
  private confirmNewPassword: string;
  private lastRegistrationCheck: number;
  private passwordChangeFailure2: string;
  private passwordChangeFailure3: string;

  constructor(private authService: AuthService, private monthInfoService: MonthInfoService, private router: Router) {
    this.currYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.profile = this.authService.getProfile();
    this.lastRegistrationCheck = this.authService.getLastRegistrationCheck();
    this.authSubscription = this.authService.profileObserv().subscribe(employee => {
      this.profile = JSON.parse(employee);
    });
    this.authService.lastRegistrationCheckObserv().subscribe(lastRegistrationCheck => {
      this.lastRegistrationCheck = lastRegistrationCheck;
    })
  }

  prepareMonthHoursStandardForm() {
    this.getStandards(this.currYear);
    let button = document.getElementById('openNavbarMonthHoursStandardFormButton');
    if (!!button) button.click();
  }

  private getStandards(year : number) {
    for (let i = 0; i< 12; i++) {
      this.standartsUi[i] = new MonthlyStandard(year, i+1);
    }
    this.monthInfoService.getSumHoursForMonths(year).subscribe(standarts => {
      this.standarts = standarts.map(value => {

        let year = +value.yearMonth.substr(0, 4);
        let month = +value.yearMonth.substr(5, 2);
        let monthlyStandard = new MonthlyStandard(year, month);
        monthlyStandard.hoursSum = value.hoursSum;
        return monthlyStandard;
      });
      this.standarts.forEach((value, index, array) => {
        this.standartsUi[value.month - 1] = value;
      });
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

  updatePassword(newPass: string) {
    this.passwordChangeSuccess = null;
    this.passwordChangeFailure = null;
    this.passwordChangeFailure2 = null;
    this.passwordChangeFailure3 = null;
    if (!!newPass) {
      if (newPass != '') {
        if (!this.isWeak(newPass)) {

        this.requstStarted = true;
        this.passwordUpdateSubscrption = this.authService.changeOwnPass(newPass).subscribe(response => {
          this.newPassword = "";
          this.confirmNewPassword = "";
          this.requstStarted = false;
          this.passwordChangeSuccess = 'הסיסמה עודכנה בהצלחה';
          let milliseconds = new Date().getMilliseconds();
          this.lastRegistrationCheck = milliseconds;
          this.authService.updateProfile(milliseconds);
          this.router.navigateByUrl('/app/dashboard');
        }, e => {
          this.newPassword = "";
          this.confirmNewPassword = "";
          this.requstStarted = false;
          this.passwordChangeFailure = "הסיסמא שהוזנה היא סיסמה הישנה";
        });
        } else {
          this.newPassword = "";
          this.confirmNewPassword = "";
          this.requstStarted = false;
          this.passwordChangeFailure = 'הסיסמא אינה עומדת בדרישות.';
          this.passwordChangeFailure2 = 'יש לוודה כי הסיסמא כוללת מינימום 6 תווים';
          this.passwordChangeFailure3 = 'מתוכם לפחות אות גדולה, ספרה או סימן פיסוק';
        }
      }
    }
  }

  isNotFreshPass(){
    return this.authService.isNotFreshPass();
  }

  getHeader(year: number, month: number): Date {
    let date = new Date();
    date.setFullYear(year, month - 1, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  logout(): void {
    this.authService.logout();
  }

  editStandard(standard: MonthlyStandard) {
    this.numberForEditing = (!!standard.hoursSum) ? standard.hoursSum : 0;
    this.isEditedStandard = standard.month;
  }

  saveStandard(standard: MonthlyStandard) {
    let float = Number.parseFloat(this.numberForEditing.toString());
    if (!!float) {
      standard.hoursSum = this.numberForEditing;
      this.isEditedStandard = -1;
      this.monthInfoService
        .updateSumHoursForMonth(standard.year + "-" + standard.month + "-01", this.numberForEditing)
        .subscribe(monthInfo => {
        });
      this.numberForEditing = 0;
    } else return
  }

  goToYear() {
    this.getStandards(this.currYear);
  }

  cancelStandard() {
    this.isEditedStandard = -1;
    this.numberForEditing = 0;
  }

  private isWeak(p: string): boolean {
    if (p.length < 6) return true;
    else {
      let _force = 0;
      let _regex = /[$-/:-?{-~!"^_`\[\]]/g;
      let _lowerLetters = /[a-z]+/.test(p);
      let _upperLetters = /[A-Z]+/.test(p);
      let _numbers = /[0-9]+/.test(p);
      let _symbols = _regex.test(p);
      let _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];
      let _passedMatches = 0;
      for (let _i = 0, _flags_1 = _flags; _i < _flags_1.length; _i++) {
        let _flag = _flags_1[_i];
        _passedMatches += _flag === true ? 1 : 0;
      }
      _force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
      _force += _passedMatches * 10;
      _force = (p.length <= 6) ? Math.min(_force, 10) : _force;
      _force = (_passedMatches === 1) ? Math.min(_force, 10) : _force;
      _force = (_passedMatches === 2) ? Math.min(_force, 20) : _force;
      _force = (_passedMatches === 3) ? Math.min(_force, 40) : _force;
      return _force < 40;
    }
  }
}
