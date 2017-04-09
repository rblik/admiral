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
  selector: 'clients-list',
  templateUrl: './missing-days.component.html',
  styleUrls: ['./missing-days.component.css']
})
export class MissingDaysComponent implements OnInit {

  private selectedType: string = 'xlsx';
  private chosenEmployee: Employee;
  private infos: WorkInfo[];
  private infosUi: WorkInfo[];
  private types: SelectItem[];
  private error: string;
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
        this.infos = infos;
        this.fillTheTable();
      }, err => {
        this.error = err;
      });
  }

  fillTheTable() {
    this.search('');
  }

  search(searchParam: string) {
    if (this.infos != null) {
      this.transformInfosBySearch(this.infos, searchParam);
    }
  }

  transformInfosBySearch(value: Array<WorkInfo>, searchParam?: string) {
    this.infosUi = value.filter(function (info: WorkInfo) {
      return info.employeeName.toLowerCase().match(searchParam.toLowerCase())
        || info.employeeSurname.toLowerCase().match(searchParam.toLowerCase())
        || info.departmentName.toLowerCase().match(searchParam.toLowerCase());
    });
  }

  getDepartmentsUi(employees: Array<Employee>) {
    employees.map(employee => this.departmentsUi.push({
      label: employee.department.name,
      value: employee.department
    }));
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
    this.downloadService.downloadMissing(this.selectedType, this.timeService.getDateString(this.timeService.fromDate), this.timeService.getDateString(this.timeService.toDate))
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
