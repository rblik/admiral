import {Component, OnDestroy, OnInit} from "@angular/core";
import {EmployeeService} from "../../service/employee.service";
import {SelectItem} from "primeng/primeng";
import {Subscription} from "rxjs/Subscription";
import {Employee} from "../../../model/employee";
import {Department} from "../../../model/department";
import {ActivatedRoute, Router} from "@angular/router";
import {TimeService} from "../../../service/time.service";

@Component({
  selector: 'admin-dashboard-header',
  templateUrl: './admin-dashboard-header.component.html'
})
export class AdminDashboardHeaderComponent implements OnInit, OnDestroy{

  private employees: Employee[];
  private employeesUi: SelectItem[] = [];
  private departmentsUi: SelectItem[] = [];
  private chosenEmployee: Employee;
  private chosenDepartment: Department;
  private error: string;
  private getEmployeesSubscription: Subscription;
  private searchDate: Date;

  constructor(private employeeService: EmployeeService, private router: Router, private route: ActivatedRoute, private timeService: TimeService) {
  }

  ngOnInit(): void {
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.employeesUi.push({label: "בחר עובד", value: null});
    this.getEmployees();
    this.searchDate = new Date();
  }

  ngOnDestroy(): void {
    if (this.getEmployeesSubscription) this.getEmployeesSubscription.unsubscribe();
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

  showDashboard(chosenEmployee: Employee){
    let date = this.timeService.getDateString(this.searchDate);
    this.router.navigate([chosenEmployee.id], {relativeTo: this.route, queryParams: {date: date}});
  }
}
