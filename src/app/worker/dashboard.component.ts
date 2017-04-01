import {Component, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {TimeService} from "../service/time.service";
import {WorkInfoService} from "../service/work-info.service";
import {Employee} from "../model/employee";
import {Agreement} from "../model/agreement";
import {WorkInfo} from "../model/work-info";

@Component({
  selector: 'worker-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  private employee: Employee;
  private currentSunday: Date;
  private nextSunday: Date;
  private timeOffset: number;
  private agreements: Agreement[];
  private workInfos: WorkInfo[];
  private uiAgreements: Agreement[];

  constructor(private timeService: TimeService, private authService: AuthService, private workService: WorkInfoService) {
  }

  ngOnInit(): void {
    this.timeOffset = 0;
    this.authService.getLoggedWorker().subscribe(emp => this.employee = emp);
    this.initWeekBorders(this.timeOffset);
    this.workService.getWorkAgreements().subscribe(agreements => this.agreements = agreements);
    this.workService.getWeekWork(
      this.timeService.getDateString(this.currentSunday),
      this.timeService.getDateString(this.nextSunday))
      .subscribe(workInfos => {
        this.workInfos = workInfos;
        this.transform(this.workInfos);
      });
  }

  getDayByWeek(sunday: Date, offset: number): Date {
    return this.timeService.getRelativeWeekDay(sunday, offset);
  }

  private initWeekBorders(offset: number) {
    this.currentSunday = this.timeService.getWeekDay(offset);
    this.nextSunday = this.timeService.getWeekDay(offset + 7);
  }

  moveWeekForward() {
    this.timeOffset += 7;
    this.initWeekBorders(this.timeOffset);
    this.workService.getWeekWork(
      this.timeService.getDateString(this.currentSunday),
      this.timeService.getDateString(this.nextSunday))
      .subscribe(workInfos => {
        this.workInfos = workInfos;
        this.transform(this.workInfos);
      });
  }

  moveWeekBack() {
    this.timeOffset -= 7;
    this.initWeekBorders(this.timeOffset);
    this.workService.getWeekWork(
      this.timeService.getDateString(this.currentSunday),
      this.timeService.getDateString(this.nextSunday))
      .subscribe(workInfos => {
        this.workInfos = workInfos;
        this.transform(this.workInfos);
      });
  }

  sum(arr: WorkInfo[]): number {
    let sum = 0;
    arr.forEach((workInfo) => sum += workInfo.duration);
    sum /=60;
    Number((sum/60).toFixed(2));
    return sum;
  }

  search(param: string) {
    this.transform(this.workInfos, param);
  }

  public transform(value: Array<WorkInfo>, searchParam?: string) {
    let param = (searchParam == undefined) ? '' : searchParam.replace(/\W/g, '');
    this.uiAgreements = this.agreements.filter(function (agreement) {
      return agreement.clientName.toLowerCase().match(param.toLowerCase());
    });
    console.log(this.uiAgreements);

    this.uiAgreements.forEach(agreement => {
      let filtered = value.filter(function (workInfo) {
        return workInfo.agreementId == agreement.agreementId;
      });

      let resultArr = [];

      for (let i = 0; i < filtered.length; i++) {
        let day = new Date(filtered[i].date).getDay();
        resultArr[day] = filtered[i];
      }
      for (let i = 0; i < 7; i++) {
        if (resultArr[i] == null) {
          let info = new WorkInfo();
          info.date = '';
          info.agreementId = agreement.agreementId;
          info.duration = 0;
          resultArr[i] = info;
        }
      }
      agreement.workInfos = resultArr;
    });
  }

}
