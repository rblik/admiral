import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Router} from "@angular/router";
import {SessionStorageService} from "ng2-webstorage";
import {EmployeeService} from "../service/employee.service";
import {SelectItem} from "primeng/primeng";
import {DepartmentService} from "../service/department.service";
import {TimeService} from "../../service/time.service";

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
  private isAdmin: boolean;
  private dateOfBirthday: Date;
  private departmentsUi: SelectItem[] = [];

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private localSt: SessionStorageService,
              private departmentService: DepartmentService,
              private timeService: TimeService,
              private route: ActivatedRoute,
              private _fb: FormBuilder) {
    this.employeeForCreation = new Employee();
  }

  ngOnInit(): void {
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.getEmployees();
    this.getDepartments();
    this.subscribeOnEditedEmployee();
    this.employeeCreationForm = this._fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', Validators.compose([Validators.required])],
      password: ['', [Validators.required]],
      birthday: [this.dateOfBirthday],
      passportId: ['', [Validators.required]],
      privatePhone: [''],
      companyPhone: [''],
      isAdmin: [false],
      chosenDepartment: [null, [Validators.required]],
      // department: [this.employeeForCreation.department, [Validators.required]]
    });
  }

  createNew(employee: any) {
    let value = employee.value;
    console.log(value);
    this.employeeForCreation.name = value.name;
    this.employeeForCreation.surname = value.surname;
    this.employeeForCreation.email = value.email;
    this.employeeForCreation.birthday = this.timeService.getDateString(value.birthday);
    this.employeeForCreation.passportId = value.passportId;
    this.employeeForCreation.privatePhone = value.privatePhone;
    this.employeeForCreation.companyPhone = value.companyPhone;
    this.employeeForCreation.roles = this.isAdmin ? ['ROLE_USER', 'ROLE_ADMIN'] : ['ROLE_USER'];
    this.employeeForCreation.password = value.password;
    this.employeeService.save(value.chosenDepartment.id, this.employeeForCreation).subscribe(employee => {
      document.getElementById("closeNewEmployeeFormButton").click();
      this.employeesUi.push(employee);
      this.errorEmployee = '';
      this.employeeCreationForm.reset();
    }, error => this.errorEmployee = error);
  }

  private getEmployees() {
    this.employeeService.getAllEmployees().subscribe(employees => {
      this.employees = employees;
      this.employeesUi = employees;
    }, error => {
      this.errorEmployees = error;
    });
  }

  private getDepartments() {
    this.departmentService.getAll().subscribe(departments => {
      departments.forEach(department => {
        this.departmentsUi.push({label: department.name, value: department})
      });
    })
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
