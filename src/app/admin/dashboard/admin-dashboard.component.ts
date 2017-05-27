import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {SessionStorageService} from "ng2-webstorage";
import {WorkInfoService} from "../../service/work-info.service";
import {LockService} from "../../service/lock.service";
import {TimeService} from "../../service/time.service";
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import {Employee} from "../../model/employee";
import {EmployeeService} from "../service/employee.service";
import {AgreementDto} from "../../model/agreement-dto";
import {SelectItem} from "primeng/primeng";
import {Observable} from "rxjs/Observable";
import {WorkInfo} from "../../model/work-info";
import {DateLock} from "../../model/date-lock";
import {Url} from "../../url";
import {AdminLockService} from "../service/admin-lock.service";
import {AgreementService} from "../service/agreement.service";
import {WorkUnit} from "../../model/work-unit";

@Component({
  selector: 'admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy{
  private currentSunday: Date;
  private nextSunday: Date;
  private routeParamsSubscription: Subscription;
  private getAgreementsSubscription: Subscription;
  private sumByDayArr: number[];
  private clientsUi: string[];
  private clientsCheckboxOptions: IMultiSelectOption[];
  private clientsCheckboxSettings: IMultiSelectSettings;
  private clientsCheckboxTexts: IMultiSelectTexts;
  private employee: Employee;
  private timeOffset: number;
  private agreements: AgreementDto[];
  private clientsDropdown: SelectItem[] = [];
  private workInfos: WorkInfo[];
  private locks: DateLock[];
  private sumByWeek: number;
  private uiAgreements: AgreementDto[];
  private adminUnitsUrl: string;
  private error: string;
  private isPivotal: boolean;
  private createDialog: boolean;
  private clientForCreatingWorkInfos: string;
  private dayForCreatingWorkInfos: Date;
  private activeAgreementId: number;
  private activeDate: string;
  private dayWorkSubscription: Subscription;
  private dayWorkInfos: WorkInfo[];
  private allDayWorkSubscription: Subscription;
  private moveDaySubscription: Subscription;
  private isEdit: boolean;
  private workInfoItem: WorkInfo;
  private upsertWorkInfoSubscription: Subscription;

  constructor(private route: ActivatedRoute, private employeeService: EmployeeService, private timeService: TimeService, private lockService: AdminLockService, private agreementService: AgreementService, private workService: WorkInfoService, private sessionStorageService: SessionStorageService) {
    this.adminUnitsUrl = Url.getUrl("/admin/dashboard/units");
    this.sumByDayArr = [];
    this.fixDropdownCheckbox();
  }

  ngOnInit(): void {
    this.timeOffset = 0;
    this.initWeekBorders(this.timeOffset);
    this.routeParamsSubscription = this.route.params.switchMap((params: Params) =>
      this.employeeService.get(params['employeeId'])).subscribe(employee => {
      this.employee = employee;
      this.getAgreementsWithWorkAndRender();
    });
  }

  private initWeekBorders(offset: number) {
    this.currentSunday = this.timeService.getWeekDay(offset);
    this.nextSunday = this.timeService.getWeekDay(offset + 7);
  }

  private getAgreementsWithWorkAndRender() {
    this.getAgreementsSubscription = this.agreementService.getAgreementsByEmployee(this.employee.id).subscribe(agreements => {
      this.agreements = agreements;
      this.getClientsUi(agreements);
      this.fillDropDownList(agreements);
      this.getWorkForWeekAndRender();
    });
  }

  private getClientsUi(agreements: AgreementDto[]) {
    agreements.forEach(agreement => {
      this.clientsDropdown.push({
        label: agreement.projectName + ' - ' + agreement.clientName,
        value: agreement.agreementId
      });
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
          this.timeService.getDateString(this.nextSunday),
        this.employee.id, this.adminUnitsUrl),
        this.lockService.getLocksForPeriodAndEmployee(
          this.timeService.getDateString(this.currentSunday),
          this.timeService.getDateString(this.nextSunday),
        this.employee.id)
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

  getDayByWeek(sunday: Date, offset: number): Date {
    return this.timeService.getRelativeWeekDay(sunday, offset);
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
      this.dayWorkSubscription = this.workService.getDayWork(currentDate, workInfo.agreementId, this.employee.id, this.adminUnitsUrl).subscribe(infos => {
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
    this.allDayWorkSubscription = this.workService.getDayWork(currentDate, -1, this.employee.id, this.adminUnitsUrl).subscribe(infos => {
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
    this.moveDaySubscription = this.workService.getDayWork(currentDate, agreementId, this.employee.id, this.adminUnitsUrl).subscribe(infos => {
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
    if (this.timeService.validate(workInfo)) {
      this.error = "Wrong time range";
      return;
    }

    this.upsertWorkInfoSubscription = this.workService.save(workInfo.agreementId, this.convertToUnit(workInfo), this.employee.id, this.adminUnitsUrl)
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

  public remove(workInfo: WorkInfo) {
    this.workService.remove(workInfo.unitId, this.employee.id, this.adminUnitsUrl);
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

  private getClientNameByAgreementId(agreementId: number): string {
    return (agreementId) ? this.clientsDropdown.filter(client => client.value == agreementId)[0].label.split(" - ")[1] : '';
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

  makeWholeDay(): void {
    this.workInfoItem.from = "00:00";
    this.workInfoItem.to = "23:59";
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

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) this.routeParamsSubscription.unsubscribe();
    if (this.getAgreementsSubscription) this.getAgreementsSubscription.unsubscribe();
    if (this.allDayWorkSubscription) this.allDayWorkSubscription.unsubscribe();
    if (this.moveDaySubscription) this.moveDaySubscription.unsubscribe();
    if (this.dayWorkSubscription) this.dayWorkSubscription.unsubscribe();
    if (this.upsertWorkInfoSubscription) this.upsertWorkInfoSubscription.unsubscribe();
  }
}
