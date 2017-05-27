import {Component, OnDestroy, OnInit} from "@angular/core";
import {TimeService} from "../../service/time.service";
import {EmployeeService} from "../service/employee.service";
import {ReportService} from "../service/report.service";
import {DownloadService} from "../service/download.service";
import {SelectItem} from "primeng/primeng";
import {Employee} from "../../model/employee";
import {Department} from "../../model/department";
import {WorkInfo} from "../../model/work-info";
import * as fileSaver from "file-saver";
import {NotificationBarService, NotificationType} from "angular2-notification-bar";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'partial-days',
  templateUrl: './partial-days.component.html'
})
export class PartialDaysComponent implements OnInit, OnDestroy{
  ngOnDestroy(): void {
    if (this.getEmployeesSubscription) this.getEmployeesSubscription.unsubscribe();
    if (this.downloadPartialSubscription) this.downloadPartialSubscription.unsubscribe();
    if (this.getPartialSubscription) this.getPartialSubscription.unsubscribe();
  }
  private dashboardUrl = '/app/admin/dashboard';
  private selectedType: string = 'xlsx';
  private chosenEmployee: Employee;
  private infos: WorkInfo[];
  private infosUi: WorkInfo[];
  private types: SelectItem[];
  private error: string;
  private tableVisible: boolean;
  private chosenDepartment: Department;
  private employees: Employee[];
  private employeesUi: SelectItem[] = [];
  private departmentsUi: SelectItem[] = [];
  private limit: number;
  private durationFilter: number;
  private getEmployeesSubscription: Subscription;
  private getPartialSubscription: Subscription;
  private downloadPartialSubscription: Subscription;

  constructor(private notificationBarService: NotificationBarService, private downloadService: DownloadService, private reportService: ReportService, private employeeService: EmployeeService, private timeService: TimeService) {
    this.limit = 9;
    this.types = [];
    this.types.push({label: 'PDF', value: 'pdf'});
    this.types.push({label: 'Excel', value: 'xlsx'});
  }

  ngOnInit(): void {
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.employeesUi.push({label: "בחר עובד", value: null});
    this.getEmployees();
  }

  getEmployees(): void {
    this.getEmployeesSubscription = this.employeeService.getAll().subscribe(employees => {
      this.employees = employees;
      this.getEmployeesUi(this.chosenDepartment);
      this.getDepartmentsUi(this.employees);
    }, error => {
      this.error = error
    });
  }

  getPartialDays(){
    let from = this.timeService.getDateString(this.timeService.fromDate);
    let to = this.timeService.getDateString(this.timeService.toDate);
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.id.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.id.toString() : null;
    this.getPartialSubscription = this.reportService.getPartialDaysForPeriodAndLimit(from, to, this.limit, employeeId, departmentId)
      .subscribe(infos => {
        this.infosUi = infos;
        this.tableVisible = true;
      }, err => {
        this.error = err;
      });
  }

  getDepartmentsUi(employees: Array<Employee>) {
    let arr = [];
    employees.map(employee => {
      if (arr.indexOf(employee.department.name) == -1) {
        this.departmentsUi.push({
          label: employee.department.name,
          value: employee.department
        });
        arr.push(employee.department.name);
      }
    });
  }

  getEmployeesUi(department: Department) {
    this.chosenEmployee = null;
    this.employeesUi = [];
    let filter = this.employees.filter(function (employee) {
      return department != null ? employee.department.name === department.name : true;
    });
    this.employeesUi.push({label: "בחר עובד", value: null});
    filter.forEach(employee => this.employeesUi.push({label: employee.name + ' ' + employee.surname, value: employee}));
  }

  partialDaysReport() {
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.id.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.id.toString() : null;
    let fromDate = this.timeService.getDateString(this.timeService.fromDate);
    let toDate = this.timeService.getDateString(this.timeService.toDate);
    this.downloadPartialSubscription = this.downloadService.downloadPartial(this.selectedType, fromDate, toDate, employeeId, departmentId)
      .subscribe(res => {
          let appType = this.downloadService.getMimeType(this.selectedType);
          let blob = new Blob([res.blob()], {type: appType});
          fileSaver.saveAs(blob, 'partial.' + this.selectedType);
        },
        err => {
          this.notificationBarService.create({message: 'הורדה נכשלה', type: NotificationType.Error});
          this.error = err;
        });
  }
}
