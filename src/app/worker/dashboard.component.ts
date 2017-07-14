import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import * as fileSaver from "file-saver";
import {TimeService} from "../service/time.service";
import {WorkInfoService} from "../service/work-info.service";
import {Employee} from "../model/employee";
import {AgreementDto} from "../model/agreement-dto";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";
import {Event} from "../model/event";
import {SessionStorageService} from 'ng2-webstorage';
import {SelectItem} from "primeng/primeng";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
import {LockService} from "../service/lock.service";
import {UserDownloadService} from "../service/user-download.service";
import {NotificationBarService, NotificationType} from "angular2-notification-bar";
import {MinutesToHoursPipe} from "../pipe/minutes-to-hours.pipe";

@Component({
  selector: 'worker-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.css'
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {

  private employee: Employee;
  private agreements: AgreementDto[];
  private workInfos: WorkInfo[];
  private lock: boolean;
  private dayBydayLock: boolean;
  private dayWorkInfos: WorkInfo[];
  private activeAgreementId: number;
  private activeDate: string;
  private createDialog: boolean;
  private workInfoItem: WorkInfo;
  private dayForCreatingWorkInfos: Date;
  private error: string;
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
  private downloadReportSubscription: Subscription;
  private selectedType: string = 'xlsx';
  private firstRender: boolean = true;
  private types: SelectItem[];
  private sumByMonth: number;
  // private neededSumByMonth: number;
  private pluu: Event[] = [];
  private header: { left: string; center: string; right: string };
  private firstDayOfMonth: Date;
  private firstDayOfNextMonth: Date;

  constructor(private notificationBarService: NotificationBarService, private minToHours: MinutesToHoursPipe, private timeService: TimeService, private downloadService: UserDownloadService, private lockService: LockService, private workService: WorkInfoService, private sessionStorageService: SessionStorageService) {
    this.types = [];
    this.sumByMonth = 0;
    // this.neededSumByMonth = 0;
    this.header = {
      left: 'today',
      center: 'title',
      right: ''
    };
  }

  private getAgreementsWithWorkAndRender() {
    this.getAgreementsSubscription = this.workService.getWorkAgreements().subscribe(agreements => {
      this.agreements = agreements;
      this.getClientsUi(agreements);
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getDayWork(event) {
    this.showPivotalWorkDayDialog(new Date(event.date.format()));
  }

  getEventWork(event) {
    this.showPivotalWorkDayDialog(new Date(event.calEvent.start));
  }

  addButtons(calendar) {
    let nextPrevGroupDiv = $('<div>');

    let nextButton = $('<button>')
      .addClass("fc-prev-button ui-button ui-state-default ui-corner-left")
      .attr({
        type: "button"
      })
      .on('click', function () {
        calendar.next();
      }).html('<span class="ui-icon ui-icon-circle-triangle-w"></span>');

    let prevButton = $('<button>')
      .addClass("fc-next-button ui-button ui-state-default ui-corner-right")
      .attr({
        type: "button"
      })
      .on('click', function () {
        calendar.prev();
      }).html('<span class="ui-icon ui-icon-circle-triangle-e"></span>');

    nextPrevGroupDiv.append(nextButton);
    nextPrevGroupDiv.append(prevButton);
    let uploadGroupDiv = $('<div>').addClass('button-group');

    $('.fc-left').prepend(nextPrevGroupDiv);
    let downloadPivotal = $('#downloadPivotal');
    let downloadTemplate = $('#downloadTemplate');
    let chooseXslInput = $('#chooseXslInput');
    let chooseXslLabel = $('#chooseXslLabel');
    let uploadButton = $('#uploadButton');
    let errorSuccessField = $('#errorSuccessField');
    chooseXslLabel.click(eventObject => {chooseXslInput.click()});
    let fcRight = $('.fc-right');
    uploadGroupDiv.append(downloadTemplate);
    uploadGroupDiv.append(chooseXslLabel);
    uploadGroupDiv.append(uploadButton);
    if (!this.lock) {
      fcRight.prepend(uploadGroupDiv);
      fcRight.prepend(errorSuccessField);
    } else {
      downloadPivotal.addClass('ui-corner-left');
    }
    fcRight.prepend(downloadPivotal);

    chooseXslInput.on('click touchstart', function () {
      $(this).val('');
    });

    let t = this;
    //Trigger now when you have selected any file
    chooseXslInput.change(function (e) {
      let path = $(this).val().split("\\");
      t.refreshSuccessField('black', path[path.length - 1]);
    });
    errorSuccessField.click(eventObject => errorSuccessField.text(''));
  }

  getMonthAndRender(calendar?: any) {
    if (this.firstRender) {
      this.addButtons(calendar);
      this.firstRender = false;
    }
    this.firstDayOfMonth = new Date();
    this.firstDayOfMonth.setFullYear(calendar.getDate().year(), calendar.getDate().month(), 1);
    this.firstDayOfNextMonth = new Date();
    this.firstDayOfNextMonth.setFullYear(calendar.getDate().year(), calendar.getDate().month() + 1, 1);
    this.workService.getMonthWork(
      this.timeService.getDateString(this.firstDayOfMonth),
      this.timeService.getDateString(this.firstDayOfNextMonth))
      .subscribe(workInfos => {
        this.workInfos = workInfos;
        this.refreshAllInfos(workInfos);
        // this.calculateDefaultSumByMonth(this.firstDayOfMonth, this.firstDayOfNextMonth);
    });
    if (this.firstRender) {
      this.addButtons(calendar);
      this.firstRender = false;
    }
  }
  /*calculateDefaultSumByMonth(d0: Date, d1: Date) {
    let date = new Date(d1);
    date.setDate(0);
    let monthDayCount = date.getDate();
    let nsaturdays = Math.floor((monthDayCount) / 7);
    let weekends = (2 * nsaturdays + (d0.getDay() == 5 ? 1 : 0) - (d1.getDay() == 6 ? 1 : 0));

    let workingDays = monthDayCount - weekends;
    this.neededSumByMonth = workingDays * 540;
  }*/

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

  ngOnInit(): void {
    this.localStSubscription = this.sessionStorageService.observe('employee')
      .subscribe((employee) => this.employee = JSON.parse(employee));
    this.getAgreementsWithWorkAndRender();
  }

  getDayByMonth(sunday: Date, offset: number): Date {
    return this.timeService.getRelativeMonthDay(sunday, offset);
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
    Observable.forkJoin(
      [
        this.workService.getDayWork(currentDate, -1),
        this.lockService.isLockedForMonth(
          this.firstDayOfMonth.getFullYear(),
          this.firstDayOfMonth.getMonth()
        )
      ]).subscribe(([infos, lock]) => {
      this.dayWorkInfos = infos;
      this.dayBydayLock = lock;
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
      this.moveDaySubscription = this.workService.getDayWork(currentDate, agreementId==null? -1: agreementId).subscribe(infos => {
        this.dayWorkInfos = infos;
      });
    } else {
      Observable.forkJoin(
        [
          this.workService.getDayWork(currentDate, agreementId==null? -1: agreementId),
          this.lockService.isLockedForMonth(
            this.dayForCreatingWorkInfos.getFullYear(),
            this.dayForCreatingWorkInfos.getMonth()
          )
        ]).subscribe(([infos, lock]) => {
        this.dayWorkInfos = infos;
        this.dayBydayLock = lock;
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
    this.upsertWorkInfoSubscription = this.workService.save(workInfo.agreementId, this.convertToUnit(workInfo))
      .subscribe(workUnit => {
        this.error = '';
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
    this.workService.remove(workInfo.unitId);
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

  private getClientsUi(agreements: AgreementDto[]) {
    this.clientsDropdown = [];
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

  pivotalReport(calendar: any, template?: boolean) {
    let year = calendar.getDate().year();
    let month = calendar.getDate().month() + 1;
    let from = year + '-' + (month < 10? '0'+ month : month) + '-' + '01';
    let to = year + '-' + (month + 1 < 10? '0' + (month + 1) : month + 1) + '-' + '01';
    this.downloadReportSubscription = this.downloadService.downloadPivotal(this.selectedType, from, to, template)
      .subscribe(res => {
          let appType = this.downloadService.xlsType();
          let blob = new Blob([res.blob()], {type: appType});
          fileSaver.saveAs(blob, 'week_work' + from + '-' + to + '.' + this.selectedType);
        },
        err => {
          this.notificationBarService.create({message: 'הורדה נכשלה', type: NotificationType.Error});
          this.error = err;
        });
  }

  uploadReport(calendar?) {
    let chooseXslInput = (<HTMLInputElement>document.getElementById('chooseXslInput'));
    if (!!chooseXslInput.files[0]
      && chooseXslInput.files[0]
      && (chooseXslInput.value.indexOf('.xls') !== -1
      || chooseXslInput.value.indexOf('.xlsx') !== -1)) {
      this.downloadService.uploadReports(this.firstDayOfMonth.getFullYear(), this.firstDayOfMonth.getMonth(), chooseXslInput.files[0])
        .subscribe(res => {
          this.refreshSuccessField('green', 'הקובץ הועלה בהצלחה');
          this.getMonthAndRender(calendar);
        }, err => {
          this.refreshSuccessField('red', err);
        });
    } else {
      this.refreshSuccessField('red', 'קודם תבחר את הקובץ הנכון');
    }
  }

  private refreshSuccessField(color: string, message: string) {
    $("#errorSuccessField").text('');
    $("#errorSuccessField").css('color', color);
    $("#errorSuccessField").text('\n' + message);
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
    if (this.localStSubscription) this.localStSubscription.unsubscribe();
    if (this.weekWorkSubscription) this.weekWorkSubscription.unsubscribe();
    if (this.downloadReportSubscription) this.downloadReportSubscription.unsubscribe();
  }
}
