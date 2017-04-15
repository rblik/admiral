import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Employee} from "../../model/employee";
import {SelectItem} from "primeng/primeng";
import {TimeService} from "../../service/time.service";
import {DepartmentService} from "../service/department.service";
import {EmployeeService} from "../service/employee.service";
import {SessionStorageService} from "ng2-webstorage";
@Component({
  selector: 'employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit{

  @Input() private employeeForCreation: Employee;
  public employeeCreationForm: FormGroup;
  private errorEmployee: string;
  private isAdmin: boolean;
  private dateOfBirthday: Date;
  private departmentsUi: SelectItem[] = [];

  constructor(private departmentService: DepartmentService,
              private timeService: TimeService,
              private _fb: FormBuilder,
              private employeeService: EmployeeService,
              private localSt: SessionStorageService) {
  }

  ngOnInit(): void {
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.getDepartments();
    if (this.employeeForCreation == null) {
      this.fillTheCreationForm();
    } else {
      this.fillTheEditingForm();
    }
  }

  private fillTheCreationForm() {
    this.employeeForCreation = new Employee();
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

  private fillTheEditingForm() {
    this.dateOfBirthday = new Date(this.employeeForCreation.birthday);
    this.isAdmin = this.employeeForCreation.roles.indexOf('ROLE_ADMIN') != -1;
    this.employeeCreationForm = this._fb.group({
      name: [this.employeeForCreation.name, [Validators.required]],
      surname: [this.employeeForCreation.surname, [Validators.required]],
      email: [this.employeeForCreation.email, Validators.compose([Validators.required])],
      password: ['', [Validators.required]],
      birthday: [this.dateOfBirthday],
      passportId: [this.employeeForCreation.passportId, [Validators.required]],
      privatePhone: [this.employeeForCreation.privatePhone],
      companyPhone: [this.employeeForCreation.companyPhone],
      isAdmin: [this.isAdmin],
      chosenDepartment: [this.employeeForCreation.department, [Validators.required]],
    });
  }

  private getDepartments() {
    this.departmentService.getAll().subscribe(departments => {
      departments.forEach(department => {
        this.departmentsUi.push({label: department.name, value: department})
      });
    })
  }

  submitForm(employee: any) {
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
      this.localSt.store('formEmployee', JSON.stringify({isNew: true, employee: employee}));
      this.errorEmployee = '';
      this.employeeCreationForm.reset();
    }, error => this.errorEmployee = error);
  }

}
