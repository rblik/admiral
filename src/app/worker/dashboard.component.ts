import {Component, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {TimeService} from "../service/time.service";
import {WorkInfoService} from "../service/work-info.service";
import {Employee} from "../model/employee";
import {Agreement} from "../model/agreement";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";
import {isNull} from "util";

@Component({
  selector: 'worker-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: [
    'dashboard.component.css'
  ]
})
export class DashboardComponent implements OnInit {

  private absenceTypes;
  private employee: Employee;
  private currentSunday: Date;
  private nextSunday: Date;
  private timeOffset: number;
  private agreements: Agreement[];
  private workInfos: WorkInfo[];
  private dayWorkInfos: WorkInfo[];
  private timeForCreating: Date;
  private unblockInput: boolean = false;
  private uiAgreements: Agreement[];
  private display: boolean;
  private dayForCreatingWorkInfos: string;
  private clientForCreatingWorkInfos: string;

  constructor(private timeService: TimeService, private authService: AuthService, private workService: WorkInfoService) {
    this.absenceTypes = [];
    this.absenceTypes.push({label: 'מחלה', value: "ILLNESS"});
    this.absenceTypes.push({label: 'חג', value: "HOLIDAY"});
    this.absenceTypes.push({label: 'חופשה', value: "VACATION"});
    this.absenceTypes.push({label: 'מלוים', value: "ARMY"});
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

    this.uiAgreements.forEach(agreement => {
      let filtered: WorkInfo[] = value.filter(function (workInfo) {
        return workInfo.agreementId == agreement.agreementId;
      });

      let resultArr: WorkInfo[] = [];

      for (let i = 0; i < filtered.length; i++) {
        let day = new Date(filtered[i].date).getDay();
        resultArr[day] = filtered[i];
      }
      for (let i = 0; i < 7; i++) {
        if (resultArr[i] == null) {
          let info = new WorkInfo();
          info.date = this.timeService.getDateString(this.timeService.getRelativeWeekDay(this.currentSunday, i));
          info.agreementId = agreement.agreementId;
          info.duration = 0;
          resultArr[i] = info;
        }
      }
      agreement.workInfos = resultArr;
    });
  }
  showDialog(workInfo: WorkInfo, agreementId: number, clientName: string) {
    this.clientForCreatingWorkInfos = clientName;
    this.dayForCreatingWorkInfos = new Date(workInfo.date).toDateString();
    this.workService.getDayWork(workInfo.date, workInfo.agreementId).subscribe(infos => {
      if (infos.length == 0) {
        let workInfoItem = new WorkInfo();
        workInfoItem.agreementId = workInfo.agreementId;
        workInfoItem.date = workInfo.date;
        workInfoItem.duration = 0;
        this.dayWorkInfos = [workInfoItem];
      } else {
        this.dayWorkInfos = infos;
      }
    });
    this.display = true;
  }
  closeDialog() {
    this.dayWorkInfos = [new WorkInfo()];
    this.display = false;
  }

  edit(){
    this.unblockInput = true;
  }

  save(workInfo: WorkInfo){
    this.unblockInput = false;
    this.workService.save(workInfo.agreementId, this.convertToUnit(workInfo))
      .subscribe(workUnit => {
        console.log(workUnit);
        this.dayWorkInfos.push(this.convertToInfo(workUnit));
        this.workInfos.push(this.convertToInfo(workUnit, workInfo.agreementId));
        console.log(this.workInfos);
        this.transform(this.workInfos);
        console.log(this.uiAgreements);
      });
  }

  private convertToUnit(workInfo: WorkInfo): WorkUnit {
    let workUnit2 = new WorkUnit();
    workUnit2.id = workInfo.unitId;
    workUnit2.date = workInfo.date;
    workUnit2.start = workInfo.from;
    workUnit2.finish = workInfo.to;
    workUnit2.absenceType = workInfo.absenceType;
    workUnit2.comment = workInfo.comment;
    return workUnit2;
  }

  private convertToInfo(workUnit: WorkUnit, agreementId?: number): WorkInfo {
    let workInfo2 = new WorkInfo();
    workInfo2.unitId = workUnit.id;
    workInfo2.date = workUnit.date;
    workInfo2.from = workUnit.start;
    workInfo2.to = workUnit.finish;
    workInfo2.duration = workUnit.duration;
    workInfo2.absenceType = workUnit.absenceType;
    workInfo2.comment = workUnit.comment;
    workInfo2.agreementId = isNaN(agreementId) ? NaN : agreementId;
    return workInfo2;
  }
}
