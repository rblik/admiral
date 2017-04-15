import {Component, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Params} from "@angular/router";
import {EmployeeService} from "../service/employee.service";
@Component({
  selector: 'employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit{
  private employee: Employee;
  constructor(private employeeService: EmployeeService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.switchMap((params: Params) =>
      this.employeeService.getEmployee(params['employeeId'])).subscribe(employee => {
      this.employee = employee;
    });
  }
}
