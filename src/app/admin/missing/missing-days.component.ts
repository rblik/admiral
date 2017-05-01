import {Component, OnInit} from "@angular/core";
import {ReportService} from "../service/report.service";
import {TimeService} from "../../service/time.service";
import {WorkInfo} from "../../model/work-info";
import {EmployeeService} from "../service/employee.service";
import {Employee} from "../../model/employee";
import {SelectItem} from 'primeng/primeng'
import {Department} from "../../model/department";
import * as fileSaver from "file-saver";
import {DownloadService} from "../service/download.service";
import {IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings} from 'angular-2-dropdown-multiselect';
import {MailService} from "../service/mail.service";
import {NotificationBarService, NotificationType} from "angular2-notification-bar";

@Component({
  selector: 'missing-days',
  templateUrl: './missing-days.component.html',
  styleUrls: [
    './missing-days.component.css'
  ]
})
export class MissingDaysComponent implements OnInit {

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

  private employeeIds: number[];
  private employeesCheckboxOptions: IMultiSelectOption[];
  private employeesCheckboxSettings: IMultiSelectSettings;
  private employeesCheckboxTexts: IMultiSelectTexts;
  private mailingFrom: Date;
  private mailingTo: Date;
  private approveMsg: string;
  private mailError: string;
  private missingReportEmail: string;
  private missingReportMessage: string;
  private showReceiverEmail: boolean;

  constructor(private notificationBarService: NotificationBarService, private downloadService: DownloadService, private reportService: ReportService, private mailService: MailService, private employeeService: EmployeeService, private timeService: TimeService) {
    this.types = [];
    this.types.push({label: 'PDF', value: 'pdf'});
    this.types.push({label: 'Excel', value: 'xlsx'});
    this.mailingFrom = new Date();
    this.mailingTo = new Date();
    this.fixDropdownCheckbox();
  }

  ngOnInit(): void {
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.employeesUi.push({label: "בחר עובד", value: null});
    this.getEmployees();
  }

  private fixDropdownCheckbox() {
    this.employeesCheckboxOptions = [];
    this.employeeIds = [];
    this.employeesCheckboxSettings = {
      enableSearch: true,
      displayAllSelectedText: false,
      dynamicTitleMaxItems: 0,
      showCheckAll: true,
      showUncheckAll: true
    };
    this.employeesCheckboxTexts = {
      checkAll: 'בחר כולם',
      uncheckAll: 'בטל בחירה',
      checked: 'עובד נבחר',
      checkedPlural: 'עובדים נבחרו',
      searchPlaceholder: 'חפש',
      defaultTitle: 'בחר עובד',
      allSelected: 'כלם נבחרו',
    };
  }

  private fillDropDownList(employees: Employee[]) {
    employees.forEach(employee => {
      this.employeesCheckboxOptions.push({id: employee.id, name: employee.surname + ' ' + employee.name});
    });
  }

  getEmployees(): void {
    this.employeeService.getAllEmployees().subscribe(employees => {
      this.employees = employees;
      this.fillDropDownList(employees);
      this.getEmployeesUi(this.chosenDepartment);
      this.getDepartmentsUi(this.employees);
    }, error => {
      this.error = error
    });
  }

  getMissedDays(): void {
    let from = this.timeService.getDateString(this.timeService.fromDate);
    let to = this.timeService.getDateString(this.timeService.toDate);
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.id.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.id.toString() : null;
    this.reportService.getMissedDaysForPeriod(from, to, employeeId, departmentId)
      .subscribe(infos => {
        this.infosUi = infos;
        this.tableVisible = true;
      }, err => {
        this.error = err;
      });
  }

  openMissingMailDialog() {
    this.mailingFrom = this.timeService.fromDate;
    this.mailingTo = this.timeService.toDate;
    this.missingReportEmail = '';
    this.showReceiverEmail = false;
    let mailingFormOpen = document.getElementById('mailingFormOpen');
    if (!!mailingFormOpen) {
      mailingFormOpen.click();
    }
  }

  sendAndCloseMissingMailDialog(email: string, message: string) {
    if (this.employeeIds.length == 0) {
      this.mailError = 'אנא בחר עובד'
    } else {
      let mailingFormClose = document.getElementById('mailingFormClose');
      if (!!mailingFormClose) {
        mailingFormClose.click();
      }
      this.mailService.sendMissingByEmail(
        this.timeService.getDateString(this.timeService.fromDate),
        this.timeService.getDateString(this.timeService.toDate),
        this.employeeIds, email, message
      ).subscribe(approveMsg => {
        this.approveMsg = approveMsg;
        this.notificationBarService.create({message: 'הדוח נשלח בהצלחה', type: NotificationType.Success});
      }, err => {
        this.notificationBarService.create({message: 'הדוח לא נשלח', type: NotificationType.Error});
        this.mailError = err;
      });
    }
  }

  closeMissingMailDialog() {
    let mailingFormClose = document.getElementById('mailingFormClose');
    if (!!mailingFormClose) {
      mailingFormClose.click();
    }
  }

  getDepartmentsUi(employees: Array<Employee>) {
    let arr = [];
    employees.forEach(employee => {
      if (arr.indexOf(employee.department.id) == -1) {
        this.departmentsUi.push({
          label: employee.department.name,
          value: employee.department
        });
        arr.push(employee.department.id);
      }
    });
  }

  getEmployeesUi(department: Department) {
    this.chosenEmployee = null;
    this.employeesUi = [];
    let filter = this.employees.filter(function (employee) {
      return department != null ? employee.department.id === department.id : true;
    });
    this.employeesUi.push({label: "בחר עובד", value: null});
    filter.forEach(employee => this.employeesUi.push({label: employee.name + ' ' + employee.surname, value: employee}));
  }

  missingDaysReport() {
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.id.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.id.toString() : null;
    let fromDate = this.timeService.getDateString(this.timeService.fromDate);
    let toDate = this.timeService.getDateString(this.timeService.toDate);
    this.downloadService.downloadMissing(this.selectedType, fromDate, toDate, employeeId, departmentId)
      .subscribe(res => {
          let appType = this.downloadService.getMimeType(this.selectedType);
          let blob = new Blob([res.blob()], {type: appType});
          fileSaver.saveAs(blob, 'missing.' + this.selectedType);
        },
        err => {
          this.notificationBarService.create({message: 'הורדה נכשלה', type: NotificationType.Error});
          this.error = err;
        });
  }
}
