import {Component, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Router} from "@angular/router";
import {SessionStorageService} from "ng2-webstorage";
import {EmployeeService} from "../service/employee.service";
import {DepartmentService} from "../service/department.service";
import {Department} from "../../model/department";

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
  private departments: Department[];

  constructor(private employeeService: EmployeeService,
              private departmentService: DepartmentService,
              private router: Router,
              private localSt: SessionStorageService,
              private route: ActivatedRoute) {
    this.employeeForCreation = new Employee();
  }

  ngOnInit(): void {
    this.getDepartments();
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

  refreshDepartments(departmentObj: any) {
    if (departmentObj.isNew) {
      this.departments.push(departmentObj.dep);
    } else {
      this.departments.forEach(dep => {
        if (dep.id == departmentObj.dep.id) {
          dep.name = departmentObj.dep.name;
          return;
        }
      })
    }
  }

  filterByDepartment(departmentId: any){
    let value = departmentId;
    if (value){
    this.employeesUi = this.employees.filter(function (employee) {
      return employee.department.id == value;
    });
    }
    else {
      this.employeesUi = this.employees;
    }
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

  getDepartments(){
      this.departmentService.getAll().subscribe(departments => {
        this.departments = departments;
      })
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
