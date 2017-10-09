import {Component, OnDestroy, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Router} from "@angular/router";
import {SessionStorageService} from "ng2-webstorage";
import {EmployeeService} from "../service/employee.service";
import {Subscription} from "rxjs/Subscription";
import {ArraySortPipe} from "../../pipe/array-sort.pipe";

@Component({
  selector: 'admin-employees',
  templateUrl: './admin-employees.component.html',
  styleUrls: ['./admin-employees.component.css']
})
export class AdminEmployeesComponent implements OnInit, OnDestroy{
  private employees: Employee[];
  private employeesUi: Employee[]=[];
  private employeesUiEn: Employee[]=[];
  private employeesUiDis: Employee[];
  private employeeForCreation: Employee;
  private errorEmployees: string;
  private getEmployeesSubscription: Subscription;
  private localStDepSubscription: Subscription;
  private localStEmplSubscription: Subscription;
  private employeeIsDisabledShow:boolean=false;

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private arrSortPipe: ArraySortPipe,
              private localSt: SessionStorageService,
              private route: ActivatedRoute) {
    this.employeeForCreation = new Employee();
  }

  ngOnInit(): void {
    this.getEmployees();
    this.subscribeOnEditedEmployee();
    this.subscribeOnEditedDepartment();
  }

  toggleViewEnabledDisabled(){
    this.employeeIsDisabledShow=!this.employeeIsDisabledShow;
    this.reinitEmployees();
    this.search('')
  }

  reinitEmployees(){
    var tempEn=[];
    var tempDis=[];
    this.employeesUi.forEach(emp=>
    {
      if(emp.enabled) tempEn.push(emp);
      else tempDis.push(emp)
    })
    this.employeesUiEn=tempEn;
    this.employeesUiDis=tempDis;
  }

  ngOnDestroy(): void {
    if (this.localStDepSubscription) this.localStDepSubscription.unsubscribe();
    if (this.getEmployeesSubscription) this.getEmployeesSubscription.unsubscribe();
    if (this.localStDepSubscription) this.localStEmplSubscription.unsubscribe();
  }

  private getEmployees() {
    this.getEmployeesSubscription = this.employeeService.getAll().subscribe(employees => {
      this.employees = employees;
      this.employeesUi = employees;
      this.reinitEmployees();
    }, error => {
      this.errorEmployees = error;
    });
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
    this.reinitEmployees();
  }

  search(value: string) {
    this.employeesUi = this.employees.filter(function (employee) {
      return employee.name.toLowerCase().match(value.toLowerCase())
        || employee.surname.toLowerCase().match(value.toLowerCase())
        || employee.department.name.toLowerCase().match(value.toLowerCase());
    });
    this.reinitEmployees();
  }

  toDetail(employeeId: number) {
    this.router.navigate([employeeId], {relativeTo: this.route});
  }

  private subscribeOnEditedDepartment() {
    this.localStDepSubscription = this.localSt.observe('formDepartment').subscribe(edited => {
      let editedDepartment = JSON.parse(edited);
      if (!editedDepartment.isNew) {
        this.employeesUi.forEach(employee => {
          if (employee.department.id == editedDepartment.dep.id) {
            employee.department.name = editedDepartment.dep.name;
          }
        });
      }
      this.reinitEmployees();
    });
  }



  private subscribeOnEditedEmployee() {
    this.localStEmplSubscription = this.localSt.observe('formEmployee').subscribe(edited => {
      let editedEmployee = JSON.parse(edited);
      if (editedEmployee.isNew) {
        this.employees.push(editedEmployee.employee);
        this.filterByDepartment(null);

      } else {
        this.employees.forEach(employee => {
          if (employee.id.toString() == editedEmployee.employee.id.toString()) {
            employee.name = editedEmployee.employee.name;
            employee.surname = editedEmployee.employee.surname;
            employee.department = editedEmployee.employee.department;
            employee.enabled=editedEmployee.employee.enabled;
            this.filterByDepartment(null);
            this.reinitEmployees();
            return;
          }
        });
      }
      this.reinitEmployees();
      this.arrSortPipe.transform(this.employeesUi, 'name');
    });
  }
}
