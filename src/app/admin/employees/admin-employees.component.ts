import {Component, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Router} from "@angular/router";
import {SessionStorageService} from "ng2-webstorage";
import {EmployeeService} from "../service/employee.service";

@Component({
  selector: 'admin-employees',
  templateUrl: './admin-employees.component.html',
  styleUrls: ['./admin-employees.component.css']
})
export class AdminEmployeesComponent implements OnInit{

  private employees: Employee[];
  private employeesUi: Employee[];
  private employeeForCreation: Employee;
  private errorEmployees: string;

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private localSt: SessionStorageService,
              private route: ActivatedRoute) {
    this.employeeForCreation = new Employee();
  }

  ngOnInit(): void {
    this.getEmployees();
    this.subscribeOnEditedEmployee();
  }

  private getEmployees() {
    this.employeeService.getAllEmployees().subscribe(employees => {
      this.employees = employees;
      this.employeesUi = employees;
    }, error => {
      this.errorEmployees = error;
    });
  }

  search(value: string) {
    this.employeesUi = this.employees.filter(function (employee) {
      return employee.name.toLowerCase().match(value.toLowerCase())
        || employee.surname.toLowerCase().match(value.toLowerCase())
        || employee.department.name.toLowerCase().match(value.toLowerCase());
    });
  }

  toDetail(employeeId: number) {
    this.router.navigate([employeeId], {relativeTo: this.route});
  }

  private subscribeOnEditedEmployee() {
    this.localSt.observe('formEmployee').subscribe(edited => {
      let editedEmployee = JSON.parse(edited);
      if (editedEmployee.isNew) {
        this.employeesUi.push(editedEmployee.employee);
      } else {
        this.employeesUi.forEach(employee => {
          if (employee.id.toString() == editedEmployee.employee.id.toString()) {
            employee.name = editedEmployee.employee.name;
            employee.department.name = editedEmployee.employee.department.name;
            return;
          }
        });
      }
    });
  }
}
