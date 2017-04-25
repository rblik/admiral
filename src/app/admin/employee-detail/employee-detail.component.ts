import {Component, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Params} from "@angular/router";
import {EmployeeService} from "../service/employee.service";
import {ProjectService} from "../service/project.service";
import {Project} from "../../model/project";
import {Observable} from "rxjs/Observable";
import {Agreement} from "../../model/agreement";
import {AgreementService} from "../service/agreement.service";
import {TimeService} from "../../service/time.service";
@Component({
  selector: 'employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit{
  private employee: Employee;
  private projects: Project[];
  private agreements: Agreement[];
  constructor(private employeeService: EmployeeService, private timeService: TimeService, private projectService: ProjectService, private agreementService: AgreementService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.map((params: Params) => params['employeeId']).switchMap((employeeId: number) => {
      return Observable.forkJoin([this.employeeService.getEmployee(employeeId), this.agreementService.getAgreementsByEmployee(employeeId)]);
    }).catch(e => Observable.throw(e.json().details[0]))
      .subscribe(([employee, agreements]) => {
        this.employee = employee;
        this.agreements = agreements;
      });
  }

  isActive(agreement: Agreement):boolean{
    let now = this.timeService.getDateString(new Date());
    return agreement.start <= now && agreement.finish>=now;
  }

  appendAgreement(agreement){
    if (agreement != null) {
    this.agreements.push(agreement);
    }
  }

}
