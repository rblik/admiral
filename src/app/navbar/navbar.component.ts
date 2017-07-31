import {OnInit, Component, OnDestroy} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {Employee} from "../model/employee";
import {Subscription} from "rxjs/Subscription";
import {MonthlyStandard} from "../model/monthly-standard";
import {MonthInfoService} from "../service/month-info.service";

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

  constructor(private authService: AuthService, private monthInfoService: MonthInfoService) {
    this.currYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.profile = this.authService.getProfile();
    this.authSubscription = this.authService.profileObserv().subscribe(employee => {
      this.profile = JSON.parse(employee);
    });
  }

  prepareMonthHoursStandardForm() {
    this.getStandards(this.currYear);
    let button = document.getElementById('openNavbarMonthHoursStandardFormButton');
    if (!!button) button.click();
  }

  private getStandards(year : number) {
    let sd = [];
    console.log(sd[5]);
    for (let i = 0; i< 12; i++) {
      this.standartsUi[i] = new MonthlyStandard(year, i+1);
      console.log(this.standartsUi[i])
    }
    this.monthInfoService.getSumHoursForMonths(year).subscribe(standarts => {
      this.standarts = standarts.map(value => {

        let year = +value.yearMonth.substr(0, 4);
        let month = +value.yearMonth.substr(5, 2);
        let monthlyStandard = new MonthlyStandard(year, month);
        monthlyStandard.hoursSum = value.hoursSum;
        console.log('monthlyStandard');
        console.log(monthlyStandard);
        console.log('monthlyStandard');
        return monthlyStandard;
      });
      console.log(this.standarts);
      console.log(this.standartsUi);
      this.standarts.forEach((value, index, array) => {
        this.standartsUi[value.month - 1] = value;
      });
      console.log(this.standartsUi);
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
    if (!!newPass) {
      if (newPass != '') {
        this.requstStarted = true;
        this.passwordUpdateSubscrption = this.authService.changeOwnPass(newPass).subscribe(response => {
          this.requstStarted = false;
          this.passwordChangeSuccess = 'הסיסמה עודכנה בהצלחה';
        }, e => {
          this.passwordChangeFailure = e;
        });
      }
    }
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
    standard.hoursSum = this.numberForEditing;
    this.isEditedStandard = -1;
    this.monthInfoService
      .updateSumHoursForMonth(standard.year + "-" + standard.month + "-01", this.numberForEditing)
      .subscribe(monthInfo => {
      });
    this.numberForEditing = 0;
  }

  goToYear() {
    this.getStandards(this.currYear);
  }

  cancelStandard() {
    this.isEditedStandard = -1;
    this.numberForEditing = 0;
  }
}
