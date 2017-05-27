import {Component, OnDestroy, OnInit} from "@angular/core";
import {TimeService} from "../service/time.service";
import {WorkInfoService} from "../service/work-info.service";
import {Employee} from "../model/employee";
import {AgreementDto} from "../model/agreement-dto";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";
import {SessionStorageService} from 'ng2-webstorage';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import {SelectItem} from "primeng/primeng";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
import {LockService} from "../service/lock.service";
import {DateLock} from "../model/date-lock";

@Component({
  selector: 'worker-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.css'
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {

  private employee: Employee;
  private currentSunday: Date;
  private nextSunday: Date;
  private timeOffset: number;
  private agreements: AgreementDto[];
  private workInfos: WorkInfo[];
  private locks: DateLock[];
  private dayWorkInfos: WorkInfo[];
  private uiAgreements: AgreementDto[];
  private display: boolean;
  private activeAgreementId: number;
  private activeDate: string;
  private createDialog: boolean;
  private workInfoItem: WorkInfo;
  private dayForCreatingWorkInfos: Date;
  private clientForCreatingWorkInfos: string;
  private error: string;
  private sumByDayArr: number[];
  private sumByWeek: number;
  private clientsUi: string[];
  private clientsCheckboxOptions: IMultiSelectOption[];
  private clientsCheckboxSettings: IMultiSelectSettings;
  private clientsCheckboxTexts: IMultiSelectTexts;
  private isPivotal: boolean;
  private isEdit: boolean;
  private clientsDropdown: SelectItem[] = [];
  private localStSubscription: Subscription;
  private getAgreementsSubscription: Subscription;
  private weekWorkSubscription: Subscription;
  private dayWorkSubscription: Subscription;
  private allDayWorkSubscription: Subscription;
  private moveDaySubscription: Subscription;
  private upsertWorkInfoSubscription: Subscription;

  constructor(private timeService: TimeService, private lockService: LockService, private workService: WorkInfoService, private sessionStorageService: SessionStorageService) {
    this.sumByDayArr = [];
    this.fixDropdownCheckbox();
  }

  ngOnInit(): void {
    this.timeOffset = 0;
    this.localStSubscription = this.sessionStorageService.observe('employee')
      .subscribe((employee) => this.employee = JSON.parse(employee));
    this.initWeekBorders(this.timeOffset);
    this.getAgreementsWithWorkAndRender();
  }

  ngOnDestroy(): void {
    if (this.getAgreementsSubscription) this.getAgreementsSubscription.unsubscribe();
    if (this.localStSubscription) this.localStSubscription.unsubscribe();
    if (this.allDayWorkSubscription) this.allDayWorkSubscription.unsubscribe();
    if (this.dayWorkSubscription) this.dayWorkSubscription.unsubscribe();
    if (this.moveDaySubscription) this.moveDaySubscription.unsubscribe();
    if (this.upsertWorkInfoSubscription) this.upsertWorkInfoSubscription.unsubscribe();
    if (this.weekWorkSubscription) this.weekWorkSubscription.unsubscribe();
  }

  private fixDropdownCheckbox() {
    this.clientsCheckboxOptions = [];
    this.clientsUi = [];
    this.clientsCheckboxSettings = {
      enableSearch: true,
      displayAllSelectedText: false,
      dynamicTitleMaxItems: 0,
      showCheckAll: true,
      showUncheckAll: true
    };
    this.clientsCheckboxTexts = {
      checkAll: 'בחר כולם',
      uncheckAll: 'בטל בחירה',
      checked: 'לקוח נבחר',
      checkedPlural: 'לקוחות נבחרו',
      searchPlaceholder: 'חפש',
      defaultTitle: 'בחר לקוח',
      allSelected: 'כלם נבחרו',
    };
  }

  private getAgreementsWithWorkAndRender() {
    this.getAgreementsSubscription = this.workService.getWorkAgreements().subscribe(agreements => {
      this.agreements = agreements;
      this.getClientsUi(agreements);
      this.fillDropDownList(agreements);
      this.getWorkForWeekAndRender();
    });
  }

  private fillDropDownList(agreements: AgreementDto[]) {
    let arr = [];
    agreements.forEach(agreement => {
      if (arr.indexOf(agreement.clientName) == -1) {
        this.clientsCheckboxOptions.push({id: agreement.clientName, name: agreement.clientName});
        arr.push(agreement.clientName);
      }
    });
  }

  private getWorkForWeekAndRender() {
    Observable.forkJoin(
      [
        this.workService.getWeekWork(
          this.timeService.getDateString(this.currentSunday),
          this.timeService.getDateString(this.nextSunday)),
        this.lockService.getLocksForPeriod(
          this.timeService.getDateString(this.currentSunday),
          this.timeService.getDateString(this.nextSunday))
      ]).subscribe(([workInfos, locks]) => {
      this.workInfos = workInfos;
      this.locks = locks;
      this.transform(this.workInfos, this.clientsUi);
    });
    /*this.weekWorkSubscription = this.workService.getWeekWork(
      this.timeService.getDateString(this.currentSunday),
      this.timeService.getDateString(this.nextSunday))
      .subscribe(workInfos => {
        this.workInfos = workInfos;
        this.transform(this.workInfos, this.clientsUi);
      });*/
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
    this.getWorkForWeekAndRender();
  }

  moveWeekBack() {
    this.timeOffset -= 7;
    this.initWeekBorders(this.timeOffset);
    this.getWorkForWeekAndRender();
  }

  sum(arr: WorkInfo[]): number {
    let sum = 0;
    arr.forEach((workInfo) => sum += workInfo.duration);
    return sum;
  }

  search(params: string[]) {
    this.transform(this.workInfos, params)
  }

  public transform(infos: Array<WorkInfo>, searchParams?: string[]) {
    let params = searchParams? searchParams: [];
      this.uiAgreements = this.agreements.filter(function (agreement) {
        return params.length==0 || params.indexOf(agreement.clientName) !== -1;
      });

    this.sumByDayArr = [0, 0, 0, 0, 0, 0, 0];
    this.sumByWeek = 0;
    this.uiAgreements.forEach(agreement => {
      let filtered: WorkInfo[] = infos.filter(function (workInfo) {
        return workInfo.agreementId == agreement.agreementId;
      });

      let resultArr: WorkInfo[] = [];

      for (let i = 0; i < filtered.length; i++) {
        let day = new Date(filtered[i].date).getDay();
        resultArr[day] = filtered[i];
        this.sumByDayArr[day] += resultArr[day].duration;
        this.sumByWeek += resultArr[day].duration;
      }
      for (let i = 0; i < 7; i++) {
        if (resultArr[i] == null) {
          let info = new WorkInfo();
          info.date = this.timeService.getDateString(this.timeService.getRelativeWeekDay(this.currentSunday, i));
          info.agreementId = agreement.agreementId;
          info.duration = 0;
          info.editable = !this.lockService.isLocked(this.locks, info);
          resultArr[i] = info;
        }
        else {
          resultArr[i].editable = !this.lockService.isLocked(this.locks, resultArr[i]);
        }
      }
      agreement.workInfos = resultArr;
    });
  }

  showWorkDayDialog(workInfo: WorkInfo, agreement: AgreementDto) {
    if (workInfo.editable === false) {
      return;
    } else {
      let currentDate = workInfo.date;
      this.isPivotal = false;
      this.error = '';
      this.createDialog = false;
      this.clientForCreatingWorkInfos = agreement.clientName;
      this.dayForCreatingWorkInfos = new Date(currentDate);
      this.activeAgreementId = workInfo.agreementId;
      this.activeDate = currentDate;
      this.dayWorkSubscription = this.workService.getDayWork(currentDate, workInfo.agreementId).subscribe(infos => {
        this.dayWorkInfos = infos;
      });
      let openModalButton = document.getElementById('openModalButton');
      if (!!openModalButton) {
        openModalButton.click();
      }
    }
  }

  isEmptyDay(dayWorkInfos: WorkInfo[]): boolean {
    return !!dayWorkInfos ? dayWorkInfos.length == 0 : false;
  }

  showPivotalWorkDayDialog(date: Date) {
    let currentDate = this.timeService.getDateString(date);
    this.isPivotal = true;
    this.error = '';
    this.createDialog = false;
    this.activeAgreementId = null;
    this.dayForCreatingWorkInfos = new Date(currentDate);
    this.activeDate = currentDate;
    this.allDayWorkSubscription = this.workService.getDayWork(currentDate, -1).subscribe(infos => {
      this.dayWorkInfos = infos;
    });
    let openModalButton = document.getElementById('openModalButton');
    if(!!openModalButton) {
      openModalButton.click();
    }
  }

  moveDay(workDate: Date, step: number, agreementId?: number) {
    let currentDate = this.timeService.getDateString(this.getDayByWeek(new Date(workDate), step));
    this.error = '';
    this.createDialog = false;
    this.dayForCreatingWorkInfos = new Date(currentDate);
    this.activeDate = currentDate;
    this.moveDaySubscription = this.workService.getDayWork(currentDate, agreementId).subscribe(infos => {
      this.dayWorkInfos = infos;
    });
  }

  create() {
    this.isEdit = false;
    this.workInfoItem = new WorkInfo();
    this.workInfoItem.agreementId = !this.isPivotal? this.activeAgreementId : this.clientsDropdown[0].value;
    this.workInfoItem.date = this.activeDate;
    this.workInfoItem.duration = 0;
    this.createDialog = true;
  }

  edit(workInfo: WorkInfo) {
    this.isEdit = true;
    this.workInfoItem = workInfo;
    this.createDialog = true;
  }

  closeDialog() {
    this.error = '';
    let dayWorkInfoFormClose = document.getElementById('dayWorkInfoFormClose');
    if (!!dayWorkInfoFormClose) {
      dayWorkInfoFormClose.click();
    }
    this.createDialog = false;
    setTimeout(() => {
      this.dayWorkInfos = [new WorkInfo()];
    }, 500);
  }

  save(workInfo: WorkInfo) {
    if (this.validate(workInfo)) {
      this.error = "Wrong time range";
      return;
    }

    this.upsertWorkInfoSubscription = this.workService.save(workInfo.agreementId, this.convertToUnit(workInfo))
      .subscribe(workUnit => {
        this.error = '';
        let saved: WorkInfo = this.convertToInfo(workUnit, workInfo.agreementId);
        saved.clientName = this.getClientNameByAgreementId(workInfo.agreementId);
        this.replaceInDayWorkInfos(saved);
        this.replaceInAllWorkInfos(saved, workInfo.duration, workInfo.unitId != null);
        this.transform(this.workInfos, this.clientsUi);
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
    this.transform(this.workInfos, this.clientsUi);
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

  private replaceInDayWorkInfos(workInfo: WorkInfo) {
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

  private getClientsUi(agreements: AgreementDto[]) {
    agreements.forEach(agreement => {
      this.clientsDropdown.push({
        label: agreement.projectName + ' - ' + agreement.clientName,
        value: agreement.agreementId
      });
    });
  }

  private getClientNameByAgreementId(agreementId: number): string {
    return (agreementId) ? this.clientsDropdown.filter(client => client.value == agreementId)[0].label.split(" - ")[1] : '';
  }

  private convertToUnit(workInfo: WorkInfo): WorkUnit {
    let workUnit2 = new WorkUnit();
    workUnit2.id = workInfo.unitId;
    workUnit2.date = workInfo.date;
    workUnit2.start = workInfo.from;
    workUnit2.finish = workInfo.to;
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
    workInfo2.comment = workUnit.comment;
    workInfo2.agreementId = isNaN(agreementId) ? NaN : agreementId;
    return workInfo2;
  }

  makeWholeDay(): void {
    this.workInfoItem.from = "00:00";
    this.workInfoItem.to = "23:59";
  }
}
