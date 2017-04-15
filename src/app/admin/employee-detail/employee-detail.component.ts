import {Component, OnInit} from "@angular/core";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Params} from "@angular/router";
import {SessionStorageService} from "ng2-webstorage";
import {EmployeeService} from "../service/employee.service";
@Component({
  selector: 'employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit{
  private employee: Employee;
  public employeeEditingForm: FormGroup;
  private errorEmployee: string;
  constructor(private employeeService: EmployeeService, private _fb: FormBuilder, private localSt: SessionStorageService, private route: ActivatedRoute) {
    this.employee = new Employee();
  }

  ngOnInit(): void {
    this.route.params.switchMap((params: Params) =>
      this.employeeService.getEmployee(params['employeeId'])).subscribe(employee => {
      this.employee = employee;
      this.populateEmployee(employee);
    });
  }

  private populateEmployee(employee) {
    /*this.employeeEditingForm = this._fb.group({
      name: [client.name, [Validators.required]],
      companyNumber: [client.companyNumber, [Validators.required]],
      phones: this._fb.array(client.phones),
      addresses: this._fb.array([])
    });*/
  }
}
