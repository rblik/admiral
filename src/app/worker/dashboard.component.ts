import {Component, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {TimeService} from "../service/time.service";
import {WorkInfoService} from "../service/work-info.service";
import {Employee} from "../model/employee";
import {Agreement} from "../model/agreement";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";
import {SessionStorageService, SessionStorage} from 'ng2-webstorage';

@Component({
  selector: 'worker-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.css'
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
  private uiAgreements: Agreement[];
  private display: boolean;
  private activeAgreementId: number;
  private activeDate: string;
  private createDialog: boolean;
  private workInfoItem: WorkInfo;
  private dayForCreatingWorkInfos: string;
  private clientForCreatingWorkInfos: string;
  private error: string;

  constructor(private timeService: TimeService, private workService: WorkInfoService, private sessionStorageService: SessionStorageService) {
    this.absenceTypes = [];
    this.absenceTypes.push({label: 'מחלה', value: "ILLNESS"});
    this.absenceTypes.push({label: 'חג', value: "HOLIDAY"});
    this.absenceTypes.push({label: 'חופשה', value: "VACATION"});
    this.absenceTypes.push({label: 'מלוים', value: "ARMY"});
  }

  ngOnInit(): void {
    this.timeOffset = 0;
    this.sessionStorageService.observe('employee')
      .subscribe((employee) => this.employee = JSON.parse(employee));
    this.initWeekBorders(this.timeOffset);
    this.workService.getWorkAgreements().subscribe(agreements => {
      this.agreements = agreements;
      this.workService.getWeekWork(
        this.timeService.getDateString(this.currentSunday),
        this.timeService.getDateString(this.nextSunday))
        .subscribe(workInfos => {
          this.workInfos = workInfos;
          this.transform(this.workInfos);
        });
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

  showDialog(workInfo: WorkInfo, clientName: string) {
    this.error = '';
    this.createDialog = false;
    this.clientForCreatingWorkInfos = clientName;
    this.dayForCreatingWorkInfos = new Date(workInfo.date).toDateString();
    this.activeAgreementId = workInfo.agreementId;
    this.activeDate = workInfo.date;
    this.workService.getDayWork(workInfo.date, workInfo.agreementId).subscribe(infos => {
      this.dayWorkInfos = infos;
    });
    this.display = true;
  }

  create() {
    this.workInfoItem = new WorkInfo();
    this.workInfoItem.agreementId = this.activeAgreementId;
    this.workInfoItem.date = this.activeDate;
    this.workInfoItem.duration = 0;
    this.createDialog = true;
  }

  edit(workInfo: WorkInfo) {
    this.workInfoItem = workInfo;
    this.createDialog = true;
  }

  closeDialog() {
    this.error = '';
    this.dayWorkInfos = [new WorkInfo()];
    this.display = false;
    this.createDialog = false;
  }

  save(workInfo: WorkInfo) {
    if (this.validate(workInfo)) {
      this.error = "Wrong time range";
      return;
    }

    this.workService.save(workInfo.agreementId, this.convertToUnit(workInfo))
      .subscribe(workUnit => {
        this.error = '';
        let saved = this.convertToInfo(workUnit, workInfo.agreementId);
        this.replaceInDayWorkInfos(saved);
        this.replaceInAllWorkInfos(saved, workInfo.duration, workInfo.unitId != null);
        this.transform(this.workInfos);
        this.createDialog = false;
        this.workInfoItem = null;
      }, err => this.error = err);
  }

  private validate(workInfo: WorkInfo) {
    return parseInt(workInfo.from.substr(0, 2)) > 23
      || parseInt(workInfo.from.substr(3, 2)) > 59
      || parseInt(workInfo.to.substr(0, 2)) > 23
      || parseInt(workInfo.to.substr(3, 2)) > 59
      || workInfo.from > workInfo.to;
  }

  public remove(workInfo: WorkInfo) {
    this.workService.remove(workInfo.unitId);
    this.removeInDayWorkInfos(workInfo);
    this.removeInAllWorkInfos(workInfo);
    this.transform(this.workInfos);
  }

  private removeInDayWorkInfos(workInfo: WorkInfo) {
    let index = -1;
    for (let i = 0; i < this.dayWorkInfos.length; i++) {
      if (this.dayWorkInfos[i].unitId === workInfo.unitId) {
        index = i;
        break;
      }
    }
    this.dayWorkInfos.splice(index, 1);
  }

  private removeInAllWorkInfos(workInfo: WorkInfo) {
    for (let i = 0; i < this.workInfos.length; i++) {
      if (this.workInfos[i].agreementId === workInfo.agreementId && this.workInfos[i].date === workInfo.date) {
        this.workInfos[i].duration -= workInfo.duration;
        return;
      }
    }
  }

  private replaceInDayWorkInfos(workInfo) {
    let index = -1;
    for (let i = 0; i < this.dayWorkInfos.length; i++) {
      if (this.dayWorkInfos[i].unitId === workInfo.unitId) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      this.dayWorkInfos.push(workInfo);
    } else {
      this.dayWorkInfos[index] = workInfo;
    }
  }

  private replaceInAllWorkInfos(workInfo: WorkInfo, duration: number, isNotNew: boolean) {
    for (let i = 0; i < this.workInfos.length; i++) {
      if (this.workInfos[i].date === workInfo.date && this.workInfos[i].agreementId == workInfo.agreementId) {
        if (isNotNew) {
          this.workInfos[i].duration -= duration;
        }
        this.workInfos[i].duration += workInfo.duration;
        return;
      }
    }
    this.workInfos.push(workInfo);
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

  makeWholeDay(): void {
    this.workInfoItem.from = "00:00";
    this.workInfoItem.to = "23:59";
  }
}
