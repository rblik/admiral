import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {AgreementDto} from "../../model/agreement-dto";
import {Project} from "../../model/project";
import {Employee} from "../../model/employee";
import {SelectItem} from "primeng/primeng";
import {AgreementService} from "../service/agreement.service";
import {EmployeeService} from "../service/employee.service";
import {Agreement} from "../../model/agreement";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Department} from "../../model/department";

@Component({
  selector: 'project-employee-form',
  templateUrl: './project-employee-form.component.html',
  styleUrls: ['./project-employee-form.component.css']
})
export class ProjectEmployeeFormComponent implements OnInit, OnChanges {

  @Input() project: Project;
  @Input() agreement: Agreement;
  @Input() clientName: string;
  private errorEmployee: string;
  private employeesUi: SelectItem[] = [];
  private employees: Employee[] = [];
  private departmentsUi: SelectItem[] = [];
  private errorEmployees: string;
  private agreementCreationForm: FormGroup;
  private currenciesUi: SelectItem[] = [];
  private tariffTypesUi: SelectItem[] = [];


  constructor(private employeeService: EmployeeService, private agreementService: AgreementService, private _fb: FormBuilder) {
    this.agreement = new Agreement();
  }

  ngOnInit(): void {
    this.fillDropDowns();
    this.fillTheCreationForm();
    this.getEmployeesWithDepartments();
  }

  private getEmployeesWithDepartments() {
    this.employeeService.getAllEmployees().subscribe(employees => {
      this.employees = employees;
      this.initDepartments();
      this.initEmployees(null);
    }, error => this.errorEmployees = error);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project']) {
      this.project = changes['project'].currentValue;
    }
    if (changes['agreement']) {
      this.agreement = changes['agreement'].currentValue;
      this.fillTheForm(this.agreement);
      this.initDepartments();
      this.initEmployees(null);
    }
  }

  initDepartments() {
    let arr = [];
    this.departmentsUi = [];
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.employees.forEach(employee => {
      if (arr.indexOf(employee.department.id) == -1) {
        this.departmentsUi.push({
          label: employee.department.name,
          value: employee.department.id
        });
        arr.push(employee.department.id);
      }
    });
  }

  initEmployees(departmentId: any) {
    this.employeesUi = [];
    this.employeesUi.push({label: "בחר עובד", value: null});
    let filtered = departmentId == null ? this.employees : this.employees.filter(function (employee) {
      return employee.department.id.toString() === departmentId.toString();
    });
    filtered.forEach(employee => {
      this.employeesUi.push({
        label: employee.name + ' ' + employee.surname,
        value: employee.id
      });
    });
  }

  save(agreement: any) {
    if (!!agreement) {
      let employeeId = agreement.employee;
      agreement.department = null;
      agreement.employee = null;
    this.agreementService.save(employeeId, this.project.id, agreement).subscribe(saved => {
        if (agreement.id == null) {
          if (!this.project.workAgreements) {
            this.project.workAgreements = [];
          }
          this.project.workAgreements.push(saved);
        } else {
          this.project.workAgreements.forEach((value, index, array) => {
            if (agreement.id == value.id){
              array[index] = saved;
              return;
            }
          });
        }
        let closeProjectEmployeeForm = document.getElementById('closeProjectEmployeeForm');
        if (!!closeProjectEmployeeForm) {
          closeProjectEmployeeForm.click();
        }
      },
      error => this.errorEmployee = error);
    }
  }

  private fillDropDowns() {
    this.currenciesUi.push({label: 'ש"ח', value: 'SHEKEL'});
    this.currenciesUi.push({label: 'דולר', value: 'DOLLAR'});
    this.currenciesUi.push({label: 'יורו', value: 'EURO'});
    this.tariffTypesUi.push({label: 'שעתי', value: 'HOUR'});
    this.tariffTypesUi.push({label: 'יומי', value: 'DAY'});
    this.tariffTypesUi.push({label: 'חודשי', value: 'MONTH'});
    this.tariffTypesUi.push({label: 'פיקס', value: 'FIX'});
  }

  private fillTheCreationForm() {
    this.agreementCreationForm = this._fb.group({
      id: [],
      active: [true],
      employee: [],
      department: [],
      tariff: this._fb.group({
        id: [],
        amount: [this.project?this.project.tariff.amount:'', [Validators.required]],
        currency: [this.project?this.project.tariff.currency:'', [Validators.required]],
        type: [this.project?this.project.tariff.type:'', [Validators.required]],
      })
    });
  }

  private fillTheEditingForm() {
    if (!!this.agreement) {
      this.agreementCreationForm = this._fb.group({
        id: [this.agreement.id],
        active: [this.agreement.active],
        employee: [this.agreement.employee.id],
        department: [],
        tariff: this._fb.group({
          id: [this.agreement.id],
          amount: [this.agreement.tariff.amount, [Validators.required]],
          currency: [this.agreement.tariff.currency, [Validators.required]],
          type: [this.agreement.tariff.type, [Validators.required]],
        })
      });
    }
  }

  private fillTheForm(agreement: Agreement) {
    if (agreement == null || this.agreement.id==null) {
      this.fillTheCreationForm();
    } else {
      this.fillTheEditingForm();
    }
  }
}
