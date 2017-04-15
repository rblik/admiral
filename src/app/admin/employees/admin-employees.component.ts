import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
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
  public employeeCreationForm: FormGroup;
  private errorEmployee: string;
  private errorEmployees: string;

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private localSt: SessionStorageService,
              private route: ActivatedRoute,
              private _fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.getEmployees();
    this.subscribeOnEditedEmployee();
    this.employeeCreationForm = this._fb.group({
      name: ['', [Validators.required]],
      companyNumber: ['', [Validators.required]],
      phones: this._fb.array([''])
    });
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
    this.localSt.observe('editedEmployee').subscribe(edited => {
      let editedEmployee = JSON.parse(edited);
      this.employeesUi.forEach(employee => {
        if (employee.id.toString() == editedEmployee.id.toString()) {
          employee.name = editedEmployee.name;
          return;
        }
      });
    });
  }
}
