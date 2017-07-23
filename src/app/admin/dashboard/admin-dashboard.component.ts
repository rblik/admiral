import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
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

@Component({
  selector: 'admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy{
  private routeParamsSubscription: Subscription;
  private getAgreementsSubscription: Subscription;
  private employee: Employee;
  private lockClass: string;
  private agreements: AgreementDto[];
  private clientsDropdown: SelectItem[] = [];
  private workInfos: WorkInfo[];
  private lock: boolean;
  private dayByDayLock: boolean;
  private adminUnitsUrl: string;
  private error: string;
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
  private monthOffset: number;
  private firstAdminRender: boolean = true;
  private firstDayOfMonth: Date;
  private firstDayOfNextMonth: Date;
  private pluu: Event[] = [];
  private header: { left: string; center: string; right: string };
  private defaultMonthHours: number = 0;

  constructor(private route: ActivatedRoute,
              private employeeService: EmployeeService,
              private timeService: TimeService,
              private lockService: AdminMonthInfoService,
              private agreementService: AgreementService,
              private minToHours: MinutesToHoursPipe,
              private workService: WorkInfoService) {
    this.adminUnitsUrl = Url.getUrl("/admin/dashboard/units");
    this.sumByMonth = 0;
    this.header = {
      left: 'today',
      center: 'title',
      right: ''
    };
  }

  ngOnInit(): void {
    this.monthOffset = 0;
    this.route.queryParams.subscribe((params: Params) => {
      let date = params['date'];
      if (!!date) this.monthOffset = this.timeService.getMonthOffset(new Date(date));
      this.routeParamsSubscription = this.route.params.switchMap((params: Params) =>
        this.employeeService.get(params['employeeId'])).subscribe(employee => {
        this.employee = employee;
        this.getAgreementsWithWorkAndRender();
      });
    });
  }

  private getAgreementsWithWorkAndRender() {
    this.getAgreementsSubscription = this.agreementService.getAgreementsByEmployee(this.employee.id).subscribe(agreements => {
      this.agreements = agreements;
      this.getClientsUi(agreements);
      this.refreshUiAfterEmployeeChange();
    });
  }

  private refreshUiAfterEmployeeChange() {
    this.pluu = [];
    this.sumByMonth = 0;
    this.firstAdminRender = true;
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

  getMonthAndRender(calendar?: any) {
    this.addButtons(calendar);
    this.firstDayOfMonth = new Date();
    this.firstDayOfMonth.setFullYear(calendar.getDate().year(), calendar.getDate().month(), 1);
    this.firstDayOfNextMonth = new Date();
    this.firstDayOfNextMonth.setFullYear(calendar.getDate().year(), calendar.getDate().month() + 1, 1);
    Observable.forkJoin(
      [
        this.workService.getMonthWork(
          this.timeService.getDateString(this.firstDayOfMonth),
          this.timeService.getDateString(this.firstDayOfNextMonth),
          this.employee.id, this.adminUnitsUrl),
        this.lockService.ckeckIsLockedForMonthAndEmployee(
          this.firstDayOfMonth.getFullYear(),
          this.firstDayOfNextMonth.getMonth() - 1,
          this.employee.id)
      ]).subscribe(([workInfos, monthInfo]) => {
      this.workInfos = workInfos;
      this.lock = monthInfo.locked;
      this.defaultMonthHours = monthInfo.hoursSum;
      this.lockClass = this.lock? 'fa-lock': 'fa-unlock';
      $('#lockUnlockButton').removeClass('fa-lock').removeClass('fa-unlock').addClass(this.lockClass);
      this.refreshAllInfos(workInfos);
    });
  }

  addButtons(calendar) {
    console.log('addbuttons');
    console.log($('.fc-right').children().length);
    if ($('.fc-right').children().length == 0) {

    let nextPrevGroupDiv = $('<div>').addClass('button-group');

    let nextButton = $('<button>')
      .addClass("fc-prev-button ui-button ui-state-default ui-corner-left")
      .attr({
        type: "button"
      })
      .on('click', function () {
        calendar.next();
      }).html('<span class="ui-icon ui-icon-circle-triangle-w"></span>');
    nextButton.append('</button>');

    let prevButton = $('<button>')
      .addClass("fc-next-button ui-button ui-state-default ui-corner-right")
      .attr({
        type: "button"
      })
      .on('click', function () {
        calendar.prev();
      }).html('<span class="ui-icon ui-icon-circle-triangle-e"></span>');
    prevButton.append('</button>');

    let a = $('<a>').css('cursor', 'pointer').css('font-size', 'large');
    let i = $('<i>').css('color', 'black');
    i.attr('id', 'lockUnlockButton');
    i.addClass('fa');
    let t = this;
    a.click(function () {
      t.lockUnlock();
    });
    a.append(i);

    let spanWithName = $('<span>').attr('id', 'spanWithNameForAdmin').text(this.employee.surname + ' ' + this.employee.name).css('font-size', 'large');
    nextPrevGroupDiv.append(nextButton);
    nextPrevGroupDiv.append(prevButton);
    nextPrevGroupDiv.append('</div>');

    $('.fc-left').prepend(nextPrevGroupDiv);
    $('.fc-right').prepend(spanWithName);
    $('.fc-right').prepend(a);
    console.log($('.fc-right').children().length);
    }
      $('#spanWithNameForAdmin').text(this.employee.surname + ' ' + this.employee.name);

  }

  private refreshAllInfos(workInfos: WorkInfo[]) {
    this.sumByMonth = 0;
    this.pluu.splice(0, this.pluu.length);
    this.pluu.push.apply(this.pluu, this.getEvents(workInfos));
  }

  private getEvents(workInfos: WorkInfo[]): Event[] {
    return workInfos.map(info => {
      this.sumByMonth += info.duration;
      return new Event(info.clientName + ' - ' + this.minToHours.transform(info.duration, true), info.date, info.duration);
    });
  }

  getDayWork(event) {
    this.showPivotalWorkDayDialog(new Date(event.date.format()));
  }

  getEventWork(event) {
    this.showPivotalWorkDayDialog(new Date(event.calEvent.start));
  }

  getDayByMonth(sunday: Date, offset: number): Date {
    return this.timeService.getRelativeMonthDay(sunday, offset);
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
          )]).subscribe(([infos, monthInfo]) => {
        this.dayWorkInfos = infos;
        this.dayByDayLock = monthInfo.locked;
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
        let saved: WorkInfo = this.convertToInfo(workUnit, workInfo.agreementId);
        saved.clientName = this.getClientNameByAgreementId(workInfo.agreementId);
        this.replaceInDayWorkInfos(saved);
        this.replaceInAllWorkInfos(saved, workInfo.duration, workInfo.unitId != null);
        this.refreshAllInfos(this.workInfos);
        this.createDialog = false;
        jQuery('#dayWorkInfoForm').focus();
      }, err => this.error = err);
  }

  public remove(workInfo: WorkInfo) {
    this.workService.remove(workInfo.unitId, this.employee.id, this.adminUnitsUrl);
    this.removeInDayWorkInfos(workInfo);
    this.removeInAllWorkInfos(workInfo);
    this.refreshAllInfos(this.workInfos);
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

  saveHoursSum(hoursSum: number) {
    this.lockService.saveMonthInfo(this.timeService.getDateString(this.firstDayOfMonth), this.lock, hoursSum,this.employee.id)
      .subscribe(monthInfo => {
        this.lockClass = 'fa-lock';
        $('#lockUnlockButton').removeClass('fa-unlock').addClass(this.lockClass);
        this.sumByMonth = hoursSum;
      });
  }

  lockUnlock(firstDayOfMonth?: Date){
    if (!this.lock) {
      this.lockService.saveMonthInfo(this.timeService.getDateString(this.firstDayOfMonth), true, this.sumByMonth,this.employee.id)
        .subscribe(monthInfo => {
          this.lockClass = 'fa-lock';
          $('#lockUnlockButton').removeClass('fa-unlock').addClass(this.lockClass);
          this.lock = true;
        });
    } else {

      this.lockService.removeLock(this.timeService.getDateString(this.firstDayOfMonth), this.employee.id)
        .subscribe(() => {
          this.lockClass = 'fa-unlock';
          $('#lockUnlockButton').removeClass('fa-lock').addClass(this.lockClass);
          this.lock = false;
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
