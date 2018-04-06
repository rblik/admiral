import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import {Subscription} from "rxjs/Subscription";
import {WorkInfoService} from "../../service/work-info.service";
import {TimeService} from "../../service/time.service";
import {Employee} from "../../model/employee";
import {EmployeeService} from "../service/employee.service";
import {AgreementDto} from "../../model/agreement-dto";
import {SelectItem} from "primeng/primeng";
import {Observable} from "rxjs/Observable";
import {WorkInfo} from "../../model/work-info";
import {Event} from "../../model/event";
import {Url} from "../../url";
import {AdminMonthInfoService} from "../service/admin-month-info.service";
import {AgreementService} from "../service/agreement.service";
import {WorkUnit} from "../../model/work-unit";
import {MinutesToHoursPipe} from "../../pipe/minutes-to-hours.pipe";
import {ArraySortPipe} from "../../pipe/array-sort.pipe";
import {SessionStorageService} from "ng2-webstorage";

@Component({
  selector: 'admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy{
  private routeParamsSubscription: Subscription;
  private getAgreementsSubscription: Subscription;
  private employee: Employee;
  private currentSunday: Date;
  private nextSunday: Date;
  private sumByDayArr: number[];
  private clientsUi: string[];
  private clientsCheckboxOptions: IMultiSelectOption[];
  private clientsCheckboxSettings: IMultiSelectSettings;
  private clientsCheckboxTexts: IMultiSelectTexts;
  private lockClass: string;
  private agreements: AgreementDto[] = [];
  private clientsDropdown: SelectItem[] = [];
  private projectsDropdown: SelectItem[] = [];
  private workInfos: WorkInfo[];
  private lock: boolean;
  private dayByDayLock: boolean;
  private adminUnitsUrl: string;
  private error: string;
  private sumByWeek: number;
  private isPivotal: boolean;
  private createDialog: boolean;
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
  private sumByMonth: number;
  private weekOffset: number;
  private firstAdminRender: boolean = true;
  private firstDayOfMonth: Date;
  private firstDayOfNextMonth: Date;
  private inCreation: boolean = false;
  private pluu: Event[] = [];
  private uiAgreements: AgreementDto[];
  private header: { left: string; center: string; right: string };
  private defaultMonthHours: number = 0;
  private pointDate: Date;
  private clientForCreatingWorkInfos: string;
  private chosenClient: any;
  private chosenAgreement: number;
  private weekOffsetGlobal:number;

  constructor(private route: ActivatedRoute,
              private employeeService: EmployeeService,
              private timeService: TimeService,
              private arrSortPipe: ArraySortPipe,
              private lockService: AdminMonthInfoService,
              private agreementService: AgreementService,
              private minToHours: MinutesToHoursPipe,
              private localStorage: SessionStorageService,
              private workService: WorkInfoService) {
    this.adminUnitsUrl = Url.getUrl("/admin/dashboard/units");
    this.sumByMonth = 0;
    this.sumByDayArr = [];
    this.fixDropdownCheckbox();
    this.header = {
      left: 'today',
      center: 'title',
      right: ''
    };
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
    return this.timeService.getRelativeMonthDay(sunday, offset);
  }

  moveWeekForward() {
    this.weekOffset += 7;
    console.log("saving offset "+this.weekOffset);
    this.localStorage.store("globalWeekOffset", this.weekOffset);
    this.initWeekBorders(this.weekOffset);
    this.getWorkForWeekAndRender();
  }

  moveWeekBack() {
    this.weekOffset -= 7;
    console.log("saving offset "+this.weekOffset);
    this.localStorage.store("globalWeekOffset", this.weekOffset);
    this.initWeekBorders(this.weekOffset);
    this.getWorkForWeekAndRender();
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

      console.log(filtered);

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
          info.date = this.timeService.getDateString(this.timeService.getRelativeMonthDay(this.currentSunday, i));
          info.agreementId = agreement.agreementId;
          info.duration = 0;
          resultArr[i] = info;
        }
      }
      agreement.workInfos = resultArr;
    });

    this.uiAgreements = this.uiAgreements.filter(value => value.workInfos.filter(value1 => value1.duration != 0).length != 0)
  }

  showPivotalWorkDayDialog(date: Date) {
    this.dayByDayLock = this.lock;
    let currentDate = this.timeService.getDateString(date);
    this.isPivotal = true;
    this.error = '';
    this.inCreation = false;
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

  showWorkDayDialog(workInfo: WorkInfo, agreement: AgreementDto) {
     this.chosenAgreement=agreement.agreementId
      this.dayByDayLock = this.lock;
      let currentDate = workInfo.date;
      this.isPivotal = false;
      this.error = '';
      this.inCreation = false;
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


  sum(arr: WorkInfo[]): number {
    let sum = 0;
    arr.forEach((workInfo) => sum += workInfo.duration);
    return sum;
  }

  ngOnInit(): void {
    this.localStorage.observe("globalLock").subscribe(ifLock => {
      this.lock = ifLock;
      this.lockClass = this.lock? 'fa-lock': 'fa-unlock';
    });
    this.initClientsDropDown();
    this.initProjectsDropDown();
    this.weekOffset = 0;
    this.route.queryParams.subscribe((params: Params) => {
      let date = params['date'];
      if (!!date) {
        this.pointDate = new Date(date);
        this.weekOffset = this.timeService.getDayOffset(new Date(),new Date(date));
        this.initWeekBorders(this.weekOffset);
      }
      this.routeParamsSubscription = this.route.params.switchMap((params: Params) =>
        this.employeeService.get(params['employeeId'])).subscribe(employee => {
        this.employee = employee;
        this.getAgreementsWithWorkAndRender();
      });
    });
    this.localStorage.store("globalWeekOffset", this.weekOffset);
  }

  private getAgreementsWithWorkAndRender() {
    this.getAgreementsSubscription = this.agreementService.getAgreementsByEmployee(this.employee.id).subscribe(agreements => {
      this.agreements = agreements;
      this.getProjectsUi(this.chosenClient);
      this.getClientsUi();
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

  getProjectsUi(clientId: number) {
    let buff = [];
    let arrAgreemId = [];
    let filter = this.agreements.filter(function (agreement) {
      return clientId != null ? agreement.clientId === clientId : true;
    });
    filter.forEach(agreement => {
      if (arrAgreemId.indexOf(agreement.agreementId) == -1) {
        buff.push({
          label: agreement.projectName,
          value: agreement.agreementId
        });
        arrAgreemId.push(agreement.agreementId);
      }
    });
    this.arrSortPipe.transform(buff, "label");
    this.projectsDropdown = this.projectsDropdown.slice(0,1).concat(buff);
   // this.chosenAgreement = null;

  }

  private getClientsUi() {
    let arr = [];
    let buff = this.clientsDropdown.slice(1, this.clientsDropdown.length);
    this.agreements.forEach(agreement => {
      if (arr.indexOf(agreement.clientId) === -1) {
        this.clientsDropdown.push({
          label: agreement.clientName,
          value: agreement.clientId
        });
        arr.push(agreement.clientId);
      }
    });
    this.arrSortPipe.transform(buff, "label");
    // this.clientsDropdown = this.clientsDropdown.slice(0,1).concat(buff);
  }

  private getWorkForWeekAndRender() {
    Observable.forkJoin(
      [
        this.workService.getMonthWork(
          this.timeService.getDateString(this.currentSunday),
          this.timeService.getDateString(this.nextSunday),
          this.employee.id, this.adminUnitsUrl),
        this.lockService.ckeckIsLockedForMonthAndEmployee(
          this.currentSunday.getFullYear(),
          this.currentSunday.getMonth(),
          this.employee.id)
      ]).subscribe(([workInfos, monthInfo]) => {
      this.workInfos = workInfos;
      this.lock = monthInfo.locked;
      this.defaultMonthHours = monthInfo.hoursSum;
      this.lockClass = this.lock? 'fa-lock': 'fa-unlock';
      $('#lockUnlockButton').removeClass('fa-lock').removeClass('fa-unlock').addClass(this.lockClass);
      this.transform(this.workInfos, this.clientsUi);
    });
  }

  getDayByMonth(sunday: Date, offset: number): Date {
    return this.timeService.getRelativeMonthDay(sunday, offset);
  }

  isEmptyDay(dayWorkInfos: WorkInfo[]): boolean {
    return !!dayWorkInfos ? dayWorkInfos.length == 0 : false;
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
          )]).subscribe(([infos, monthInfo]) => {
        this.dayWorkInfos = infos;
        this.dayByDayLock = monthInfo.locked;
      });
    }
  }

  jump(event?: any) {
    if ((event.keyCode == 37) && event.target.parentElement.parentElement.parentElement.id=='clientsDropdownDash') {
      let projectsDropdown = jQuery('#projectsDropdownDash').find("div.ui-helper-hidden-accessible").find(":text").get(0);
      if (!!projectsDropdown) projectsDropdown.focus();
    } else if ((event.keyCode == 39) && event.target.parentElement.parentElement.parentElement.id=='clientsDropdownDash') {
      jQuery('#dayWorkInfoTo').find(':input').focus();
    } else if ((event.keyCode == 39) && event.target.parentElement.parentElement.parentElement.id=='projectsDropdownDash') {
      let clientsDropdown = jQuery('#clientsDropdownDash').find("div.ui-helper-hidden-accessible").find(":text").get(0);
      if (!!clientsDropdown) clientsDropdown.focus();
    } else if (
      event.keyCode == 39
      && !!event.target.parentElement.attributes.id
      && event.target.parentElement.attributes.id.nodeValue === 'dayWorkInfoTo'
      && event.target.selectionStart === 0) {
      (<HTMLInputElement>jQuery('#dayWorkInfoFrom').find(':input').get(0)).focus();
    } else if (
      !!event.target.parentElement.attributes.id
      && event.target.value.indexOf('_') == -1
      && event.target.parentElement.attributes.id.nodeValue === 'dayWorkInfoFrom'
      && ((event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 37)) {
      jQuery('#dayWorkInfoTo').find(':input').focus();
    } else if (
      !!event.target.parentElement.attributes.id
      && event.target.value.indexOf('_') == -1
      && event.target.parentElement.attributes.id.nodeValue === 'dayWorkInfoTo'
      && ((event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 37)) {
      let clientsDropdown = jQuery('#clientsDropdownDash').find("div.ui-helper-hidden-accessible").find(":text").get(0);
      if (!!clientsDropdown) clientsDropdown.focus();
    }
  }

  checkForCtrlEnter(event?: any) {
    if (event.which == 13 && event.ctrlKey == true) {
      document.getElementById('confirmWorkInfoButton').click();
      return;
    }
  }

  create() {
    this.initProjectsDropDown();
    this.initClientsDropDown();
    this.getProjectsUi(this.chosenClient);
    this.getClientsUi();
    this.chosenClient = null;
    this.isEdit = false;
    this.workInfoItem = new WorkInfo();
    this.workInfoItem.agreementId = !this.isPivotal ? this.activeAgreementId : this.projectsDropdown[0].value;
    console.log(this.activeAgreementId)
    console.log(this.chosenAgreement)
    this.workInfoItem.date = this.activeDate;
    this.workInfoItem.duration = 0;
    this.inCreation = true;
    this.createDialog = true;
    setTimeout(function () {
      jQuery('#dayWorkInfoFrom').find(':input').focus();
    }, 200);
  }

  edit(workInfo: WorkInfo) {
    this.chosenClient=workInfo.clientId
    this.chosenAgreement=workInfo.agreementId
    this.isEdit = true;
    this.workInfoItem = workInfo;
    this.createDialog = true;
  }

  cancel() {
    this.error = '';
    this.inCreation = false;
    this.createDialog = false;
    jQuery('#dayWorkInfoForm').focus();
  }

  save(workInfo: WorkInfo) {
    if (this.timeService.validate(workInfo)) {
      this.error = "טווח זמן שגוי";
      return;
    }
    console.log(this.chosenAgreement)
    this.upsertWorkInfoSubscription = this.workService.save(false, this.chosenAgreement, this.convertToUnit(workInfo), this.employee.id, this.adminUnitsUrl)
      .subscribe(workUnit => {
        this.error = '';
        this.inCreation = false;
        console.log(this.chosenAgreement)
        let saved: WorkInfo = this.convertToInfo(workUnit, this.chosenAgreement);
        saved.clientName = this.getClientNameByAgreementId(this.chosenAgreement);
        saved.projectName = this.getProjectNameByAgreementId(this.chosenAgreement);
        this.replaceInDayWorkInfos(saved);
        this.getWorkForWeekAndRender();
        this.createDialog = false;
        jQuery('#dayWorkInfoForm').focus();
      }, err => this.error = err);
  }

  public remove(workInfo: WorkInfo) {
    this.workService.remove(workInfo.unitId, this.employee.id, this.adminUnitsUrl);
    this.removeInDayWorkInfos(workInfo);
    this.removeInAllWorkInfos(workInfo);
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
        if (this.workInfos[i].duration===0) {
          this.workInfos.splice(i, 1);
        }
        return;
      }
    }
  }

  private getClientNameByAgreementId(agreementId: number): string {
    return (agreementId) ? this.agreements.filter(agreement => {
      return agreement.agreementId === agreementId
    })[0].clientName:"";
  }

  private getProjectNameByAgreementId(agreementId: number): string {
    return (agreementId) ? this.agreements.filter(agreement => {
      return agreement.agreementId === agreementId
    })[0].projectName:"";
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
    this.workInfoItem.from = "09:00";
    this.workInfoItem.to = "18:00";
  }

  lockUnlock(firstDayOfMonth?: Date){
    if (!this.lock) {
      this.lockService.saveLock(this.timeService.getDateString(this.currentSunday), true, this.sumByMonth,this.employee.id)
        .subscribe(monthInfo => {
        });
      this.lockClass = 'fa-lock';
      $('#lockUnlockButton').removeClass('fa-unlock').addClass(this.lockClass);
      this.lock = true;
    } else {
      this.lockService.removeLock(this.timeService.getDateString(this.currentSunday), this.employee.id)
        .subscribe(() => {
        });
      this.lockClass = 'fa-unlock';
      $('#lockUnlockButton').removeClass('fa-lock').addClass(this.lockClass);
      this.lock = false;
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

//  changing back to week
  private initWeekBorders(offset: number) {
    this.currentSunday = this.timeService.getWeekDay(offset);
    this.nextSunday = this.timeService.getWeekDay(offset + 7);
  }

  getClient(agreementId: number) {
    if (!agreementId) this.chosenClient = null;
    else {
      this.chosenClient = null;
      let filter = this.agreements.filter(function (agreement) {
        return agreementId != null ? agreement.agreementId === agreementId : true;
      });
      this.chosenClient = filter[0].clientId;
    }
  }

  private initClientsDropDown() {
    this.clientsDropdown = [];
    this.clientsDropdown.push({label: "בחר לקוח", value: null});
  }
  private initProjectsDropDown() {
    this.projectsDropdown = [];
    this.projectsDropdown.push({label: "בחר פרויקט", value: null});
  }
}
