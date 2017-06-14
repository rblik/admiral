import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {WorkInfoService} from "../../service/work-info.service";
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
  private routeParamsSubscription: Subscription;
  private getAgreementsSubscription: Subscription;
  private sumByDayArr: number[];
  private clientsUi: string[];
  private clientsCheckboxOptions: IMultiSelectOption[];
  private clientsCheckboxSettings: IMultiSelectSettings;
  private clientsCheckboxTexts: IMultiSelectTexts;
  private employee: Employee;
  private lockClass: string;
  private agreements: AgreementDto[];
  private clientsDropdown: SelectItem[] = [];
  private workInfos: WorkInfo[];
  private lock: boolean;
  private dayByDayLock: boolean;
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
  private currentMonthFirstDay: Date;
  private nextMonthFirstDay: Date;
  private sumByMonth: number;
  private monthOffset: number;

  constructor(private route: ActivatedRoute,
              private employeeService: EmployeeService,
              private timeService: TimeService,
              private lockService: AdminLockService,
              private agreementService: AgreementService,
              private workService: WorkInfoService) {
    this.adminUnitsUrl = Url.getUrl("/admin/dashboard/units");
    this.sumByDayArr = [];
    this.fixDropdownCheckbox();
  }

  ngOnInit(): void {
    this.monthOffset = 0;
    this.route.queryParams.subscribe((params: Params) => {
      let date = params['date'];
      if (!!date) this.monthOffset = this.timeService.getMonthOffset(new Date(date));
      this.initMonthBorders(this.monthOffset);
      this.routeParamsSubscription = this.route.params.switchMap((params: Params) =>
        this.employeeService.get(params['employeeId'])).subscribe(employee => {
        this.employee = employee;
        this.getAgreementsWithWorkAndRender();
      });
    });
  }

  private initMonthBorders(offset: number) {
    this.currentMonthFirstDay = this.timeService.getFirstDayOfMonth(offset);
    this.nextMonthFirstDay = this.timeService.getFirstDayOfMonth(offset + 1);
  }

  private getAgreementsWithWorkAndRender() {
    this.getAgreementsSubscription = this.agreementService.getAgreementsByEmployee(this.employee.id).subscribe(agreements => {
      this.agreements = agreements;
      this.getClientsUi(agreements);
      this.fillDropDownList(agreements);
      this.getWorkForMonthAndRender();
    });
  }

  private getClientsUi(agreements: AgreementDto[]) {
    this.clientsDropdown = [];
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

  private getWorkForMonthAndRender() {
    Observable.forkJoin(
      [
        this.workService.getMonthWork(
          this.timeService.getDateString(this.currentMonthFirstDay),
          this.timeService.getDateString(this.nextMonthFirstDay),
        this.employee.id, this.adminUnitsUrl),
        this.lockService.ckeckIsLockedForMonthAndEmployee(
          this.currentMonthFirstDay.getFullYear(),
          this.currentMonthFirstDay.getMonth(),
        this.employee.id)
      ]).subscribe(([workInfos, lock]) => {
      this.workInfos = workInfos;
      this.lock = lock;
      this.lockClass = this.lock? 'fa-lock': 'fa-unlock';
      this.transformMonth(this.workInfos, this.clientsUi);
    });
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

  getDayByMonth(sunday: Date, offset: number): Date {
    return this.timeService.getRelativeMonthDay(sunday, offset);
  }

  moveMonthForward() {
    this.monthOffset += 1;
    this.initMonthBorders(this.monthOffset);
    this.getWorkForMonthAndRender();
  }

  moveMonthBack() {
    this.monthOffset -= 1;
    this.initMonthBorders(this.monthOffset);
    this.getWorkForMonthAndRender();
  }

  sum(arr: WorkInfo[]): number {
    let sum = 0;
    arr.forEach((workInfo) => sum += workInfo.duration);
    return sum;
  }

  search(params: string[]) {
    this.transformMonth(this.workInfos, params)
  }

  public transformMonth(infos: Array<WorkInfo>, searchParams?: string[]) {
    let params = searchParams? searchParams: [];
    this.uiAgreements = this.agreements.filter(function (agreement) {
      return params.length==0 || params.indexOf(agreement.clientName) !== -1;
    });

    let daysInMonth = this.timeService.getDaysInMonth(this.monthOffset);
    this.sumByDayArr = new Array(daysInMonth).fill(0);
    this.sumByMonth = 0;
    this.uiAgreements.forEach(agreement => {
      let filtered: WorkInfo[] = infos.filter(function (workInfo) {
        return workInfo.agreementId == agreement.agreementId;
      });

      let resultArr: WorkInfo[] = [];

      for (let i = 0; i < filtered.length; i++) {
        let day = new Date(filtered[i].date).getDate();
        resultArr[day-1] = filtered[i];
        this.sumByDayArr[day-1] += resultArr[day-1].duration;
        this.sumByMonth += resultArr[day-1].duration;
      }
      for (let i = 0; i < daysInMonth; i++) {
        if (resultArr[i] == null) {
          let info = new WorkInfo();
          info.date = this.timeService.getDateString(this.timeService.getRelativeMonthDay(this.currentMonthFirstDay, i));
          info.agreementId = agreement.agreementId;
          info.duration = 0;
          info.editable = !this.lock;
          resultArr[i] = info;
        }
        else {
          resultArr[i].editable = !this.lock;
        }
      }
      agreement.workInfos = resultArr;
    });
  }

  showWorkDayDialog(workInfo: WorkInfo, agreement: AgreementDto) {
    this.dayByDayLock = this.lock;
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

  isEmptyDay(dayWorkInfos: WorkInfo[]): boolean {
    return !!dayWorkInfos ? dayWorkInfos.length == 0 : false;
  }

  showPivotalWorkDayDialog(date: Date) {
    this.dayByDayLock = this.lock;
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
    if (!!openModalButton) {
      openModalButton.click();
    }

  }

  moveDay(workDate: Date, step: number, agreementId?: number) {
    let currentDate = this.timeService.getDateString(this.getDayByMonth(new Date(workDate), step));
    this.error = '';
    this.createDialog = false;
    let newDayForCreatingWorkInfos = new Date(currentDate);
    let lockCheckingRequired = newDayForCreatingWorkInfos.getFullYear() != this.dayForCreatingWorkInfos.getFullYear()
      || newDayForCreatingWorkInfos.getMonth() != this.dayForCreatingWorkInfos.getMonth();
    this.dayForCreatingWorkInfos = newDayForCreatingWorkInfos;
    this.activeDate = currentDate;
    if (!lockCheckingRequired) {
      this.moveDaySubscription = this.workService.getDayWork(currentDate, agreementId==null? -1: agreementId, this.employee.id, this.adminUnitsUrl).subscribe(infos => {
        this.dayWorkInfos = infos;
      });
    } else {
      Observable.forkJoin(
        [
          this.workService.getDayWork(currentDate, agreementId == null? -1: agreementId, this.employee.id, this.adminUnitsUrl),
          this.lockService.ckeckIsLockedForMonthAndEmployee(
            this.dayForCreatingWorkInfos.getFullYear(),
            this.dayForCreatingWorkInfos.getMonth(),
            this.employee.id
          )]).subscribe(([infos, lock]) => {
        this.dayWorkInfos = infos;
        this.dayByDayLock = lock;
      });
    }
  }

  jump(event?: any) {
    if (
      event.keyCode == 39
      && event.target.parentElement.attributes.id.nodeValue === 'dayWorkInfoTo'
      && event.target.selectionStart === 0) {
      (<HTMLInputElement>jQuery('#dayWorkInfoFrom').find(':input').get(0)).focus();
    } else if (
      event.keyCode == 40
      && (event.target.parentElement.attributes.id.nodeValue === 'dayWorkInfoFrom'
      || event.target.parentElement.attributes.id.nodeValue === 'dayWorkInfoTo')
      && this.isPivotal
      && !this.isEdit) {
      jQuery('#clientsDropdown').find("div.ui-helper-hidden-accessible").find(":text").get(0).focus();
    } else if (
      event.target.value.indexOf('_') == -1
      && event.target.parentElement.attributes.id.nodeValue === 'dayWorkInfoFrom'
      && ((event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 37)) {
      jQuery('#dayWorkInfoTo').find(':input').focus();
    }
  }

  checkForEnter(event?: any) {
    if (event.keyCode == 13) {
      document.getElementById('confirmWorkInfoButton').click();
      return;
    }
  }

  create() {
    this.isEdit = false;
    this.workInfoItem = new WorkInfo();
    this.workInfoItem.agreementId = !this.isPivotal? this.activeAgreementId : this.clientsDropdown[0].value;
    this.workInfoItem.date = this.activeDate;
    this.workInfoItem.duration = 0;
    this.createDialog = true;
    setTimeout(function () {
      jQuery('#dayWorkInfoFrom').find(':input').focus();
    }, 200);
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
      this.error = "טווח זמן שגוי";
      return;
    }

    this.upsertWorkInfoSubscription = this.workService.save(workInfo.agreementId, this.convertToUnit(workInfo), this.employee.id, this.adminUnitsUrl)
      .subscribe(workUnit => {
        this.error = '';
        let date = new Date(workUnit.date);
        let monthOffset = this.timeService.getMonthOffset(date);
        let saved: WorkInfo = this.convertToInfo(workUnit, workInfo.agreementId);
        saved.clientName = this.getClientNameByAgreementId(workInfo.agreementId);
        this.replaceInDayWorkInfos(saved);
        if (monthOffset == this.monthOffset) {
          this.replaceInAllWorkInfos(saved, workInfo.duration, workInfo.unitId != null);
          this.transformMonth(this.workInfos, this.clientsUi);
        }
        this.createDialog = false;
        // this.workInfoItem = null;
        jQuery('#dayWorkInfoForm').focus();
      }, err => this.error = err);
  }

  public remove(workInfo: WorkInfo) {
    this.workService.remove(workInfo.unitId, this.employee.id, this.adminUnitsUrl);
    this.removeInDayWorkInfos(workInfo);
    this.removeInAllWorkInfos(workInfo);
    this.transformMonth(this.workInfos, this.clientsUi);
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

  lockUnlock(firstDayOfMonth: Date){

    if (!this.lock) {
      this.lockService.saveLock(this.timeService.getDateString(firstDayOfMonth), this.employee.id)
        .subscribe(dateLock => {
          this.lockClass = 'fa-lock';
          this.lock = true;
          this.transformMonth(this.workInfos, this.clientsUi);
        });
    } else {

      this.lockService.removeLock(this.timeService.getDateString(firstDayOfMonth), this.employee.id)
        .subscribe(() => {
          this.lockClass = 'fa-unlock';
          this.lock = false;
          this.transformMonth(this.workInfos, this.clientsUi);
        });
    }
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
    if (this.getAgreementsSubscription) this.getAgreementsSubscription.unsubscribe();
    if (this.allDayWorkSubscription) this.allDayWorkSubscription.unsubscribe();
    if (this.moveDaySubscription) this.moveDaySubscription.unsubscribe();
    if (this.dayWorkSubscription) this.dayWorkSubscription.unsubscribe();
    if (this.upsertWorkInfoSubscription) this.upsertWorkInfoSubscription.unsubscribe();
    if (this.routeParamsSubscription) this.routeParamsSubscription.unsubscribe();
  }
}
