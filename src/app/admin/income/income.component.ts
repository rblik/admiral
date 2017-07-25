import {Component, OnDestroy, OnInit} from "@angular/core";
import {SelectItem} from "primeng/primeng";
import * as fileSaver from "file-saver";
import {WorkInfo} from "../../model/work-info";
import {AgreementDto} from "../../model/agreement-dto";
import {Subscription} from "rxjs/Subscription";
import {TimeService} from "../../service/time.service";
import {AgreementService} from "../service/agreement.service";
import {ReportService} from "../service/report.service";
import {NotificationBarService, NotificationType} from "angular2-notification-bar";
import {Router} from "@angular/router";
import {DownloadService} from "../service/download.service";
import {ArraySortPipe} from "../../pipe/array-sort.pipe";

@Component({
  selector: 'income',
  templateUrl: './income.component.html',
  styleUrls: [
    './income.component.css'
  ]
})
export class IncomeComponent implements OnInit, OnDestroy{
  private dashboardUrl = '/app/admin/dashboard';
  private selectedType: string = 'xlsx';
  private chosenEmployee;
  private chosenDepartment;
  private chosenProject;
  private chosenClient;
  private infos: WorkInfo[];
  private infosUi: WorkInfo[];
  private types: SelectItem[];
  private error: string;
  private tableVisible: boolean;
  private agreements: AgreementDto[];
  private agreementsUi: AgreementDto[];
  private employeesUi: SelectItem[] = [];
  private departmentsUi: SelectItem[] = [];
  private projectUi: SelectItem[] = [];
  private clientUi: SelectItem[] = [];
  private getAgreementsSubscription: Subscription;
  private getIncomeSubscription: Subscription;
  private downloadIncomeSubscription: Subscription;

  constructor(private notificationBarService: NotificationBarService,
              private router: Router,
              private arrSortPipe: ArraySortPipe,
              private downloadService: DownloadService,
              private reportService: ReportService,
              private agreementService: AgreementService,
              private timeService: TimeService) {
    this.types = [];
    this.types.push({label: 'PDF', value: 'pdf'});
    this.types.push({label: 'Excel', value: 'xlsx'});
  }

  ngOnInit(): void {
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.employeesUi.push({label: "בחר עובד", value: null});
    this.projectUi.push({label: "בחר פרויקט", value: null});
    this.clientUi.push({label: "בחר לקוח", value: null});
    this.getAgreements();
  }

  getAgreements() {
    this.getAgreementsSubscription = this.agreementService.getAgreements().subscribe(agreements => {
      this.agreements = agreements;
      this.agreementsUi = agreements;
      this.getEmployeesUi(this.chosenDepartment);
      this.getDepartmentsUi();
      this.getProjectsUi(this.chosenClient);
      this.getClientsUi();
    }, error => {
      this.error = error;
    });
  }

  getEmployeesUi(departmentId: number) {
    this.chosenEmployee = null;
    this.employeesUi = [];
    let arr = [];
    let filter = this.agreementsUi.filter(function (agreement) {
      return departmentId != null ? agreement.departmentId === departmentId : true;
    });
    this.employeesUi.push({label: "בחר עובד", value: null});
    filter.forEach(agreement => {
      if (arr.indexOf(agreement.employeeId) == -1) {
        this.employeesUi.push({
          label: agreement.employeeSurname + ' ' + agreement.employeeName,
          value: agreement.employeeId
        });
        arr.push(agreement.employeeId);
      }
    });
  }

  getDepartmentsUi() {
    let arr = [];
    let buff = this.departmentsUi.slice(1, this.departmentsUi.length);
    this.agreementsUi.forEach(agreement => {
      if (arr.indexOf(agreement.departmentId) == -1) {
        buff.push({
          label: agreement.departmentName,
          value: agreement.departmentId
        });
        arr.push(agreement.departmentId);
      }
    });
    this.arrSortPipe.transform(buff, "label");
    this.departmentsUi = this.departmentsUi.slice(0,1).concat(buff);
  }

  getProjectsUi(clientId: number) {
    this.chosenProject = null;
    this.projectUi = [];
    let arr = [];
    let filter = this.agreementsUi.filter(function (agreement) {
      return clientId != null ? agreement.clientId === clientId : true;
    });
    this.projectUi.push({label: "בחר פרויקט", value: null});
    filter.forEach(agreement => {
      if (arr.indexOf(agreement.projectId) == -1) {
        this.projectUi.push({
          label: agreement.projectName,
          value: agreement.projectId
        });
        arr.push(agreement.projectId);
      }
    });
  }

  getClientsUi() {
    let arr = [];
    let buff = this.clientUi.slice(1, this.clientUi.length);
    this.agreementsUi.forEach(agreement => {
      if (arr.indexOf(agreement.clientId) == -1) {
        buff.push({
          label: agreement.clientName,
          value: agreement.clientId
        });
        arr.push(agreement.clientId);
      }
    });
    console.log(this.clientUi);

    this.arrSortPipe.transform(buff, "label");
    this.clientUi = this.clientUi.slice(0,1).concat(buff);
  }

  getFromDate(): string {
    return this.timeService.getDateString(this.timeService.fromDate);
  }

  getAllIncome() {
    let from = this.timeService.getDateString(this.timeService.fromDate);
    let to = this.timeService.getDateString(this.timeService.toDate);
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.toString() : null;
    let projectId = this.chosenProject != null ? this.chosenProject.toString() : null;
    let clientId = this.chosenClient != null ? this.chosenClient.toString() : null;
    this.getIncomeSubscription = this.reportService.getIncomeForPeriod(from, to, employeeId, departmentId, projectId, clientId)
      .subscribe(infos => {
        this.infosUi = infos;
        this.tableVisible = true;
      }, err => {
        this.error = err;
      });
  }

  incomeReport() {
    let from = this.timeService.getDateString(this.timeService.fromDate);
    let to = this.timeService.getDateString(this.timeService.toDate);
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.toString() : null;
    let projectId = this.chosenProject != null ? this.chosenProject.toString() : null;
    let clientId = this.chosenClient != null ? this.chosenClient.toString() : null;
    this.downloadIncomeSubscription = this.downloadService.downloadIncome(this.selectedType, from, to, employeeId, departmentId, projectId, clientId)
      .subscribe(res => {
          let appType = this.downloadService.getMimeType(this.selectedType);
          let blob = new Blob([res.blob()], {type: appType});
          fileSaver.saveAs(blob, 'income-' + from + '-'+ to
            + ((employeeId)? ('-' + employeeId) : (departmentId)? ('-' + departmentId) : '')
            + ((clientId)? ('-' + clientId) : (projectId)? ('-' + projectId) : '')
            + '.' + this.selectedType);
          },
        err => {
          this.notificationBarService.create({message: 'הורדה נכשלה', type: NotificationType.Error});
          this.error = err;
        });
  }

  countIncome(duration: number, amount: number, type: string): number {
    return amount * ((type === 'HOUR') ? duration/60.0 : 1);
  }

  currencyIconClass(currency: string): string{
    return ('DOLLAR' === currency)? 'fa-dollar' : ('SHEKEL'===currency)? 'fa-shekel' : ('EURO' === currency)? 'fa-euro' :'';
  }


  ngOnDestroy(): void {
    if (this.getAgreementsSubscription) this.getAgreementsSubscription.unsubscribe();
    if (this.downloadIncomeSubscription) this.downloadIncomeSubscription.unsubscribe();
    if (this.getIncomeSubscription) this.getIncomeSubscription.unsubscribe();
  }
}
