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

@Component({
  selector: 'missing-days',
  templateUrl: './missing-days.component.html'
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

  constructor(private downloadService: DownloadService, private reportService: ReportService, private employeeService: EmployeeService, private timeService: TimeService) {
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
    this.employeeService.getAllEmployees().subscribe(employees => {
      this.employees = employees;
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
    filter.map(employee => this.employeesUi.push({label: employee.name + ' ' + employee.surname, value: employee}));
  }

  missingDaysReport() {
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.id.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.id.toString() : null;
    this.downloadService.downloadMissing(this.selectedType, this.timeService.getDateString(this.timeService.fromDate), this.timeService.getDateString(this.timeService.toDate), employeeId, departmentId)
      .subscribe(res => {
          let appType = this.getMimeType(this.selectedType);
          let blob = new Blob([res.blob()], {type: appType});
          fileSaver.saveAs(blob, 'missing.' + this.selectedType);
        },
        err => {
          this.error = err;
        });
  }

  private getMimeType(type: string): string {
    let apType;
    if (type === 'pdf') {
      apType = 'pdf';
    } else if (type === 'xls') {
      apType = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    return 'application/' + apType;
  }
}
