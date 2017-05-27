import {Component, OnDestroy, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Params} from "@angular/router";
import {EmployeeService} from "../service/employee.service";
import {Observable} from "rxjs/Observable";
import {AgreementDto} from "../../model/agreement-dto";
import {AgreementService} from "../service/agreement.service";
import {Subscription} from "rxjs/Subscription";
@Component({
  selector: 'employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy{
  private employee: Employee;
  private agreements: AgreementDto[];
  private requstStarted: boolean;
  private passwordChangeSuccess: any;
  private passwordChangeFailure: any;
  private getEmployeeWithAgreementsSubscription: Subscription;
  private passwordUpdateSubscrption: Subscription;

  constructor(private employeeService: EmployeeService, private agreementService: AgreementService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getEmployeeWithAgreementsSubscription = this.route.params.map((params: Params) => params['employeeId']).switchMap((employeeId: number) => {
      return Observable.forkJoin([this.employeeService.get(employeeId), this.agreementService.getAgreementsByEmployee(employeeId)]);
    }).catch(e => Observable.throw(e.json().details[0]))
      .subscribe(([employee, agreements]) => {
        this.employee = employee;
        this.agreements = agreements;
      });
  }

  ngOnDestroy(): void {
    if (this.getEmployeeWithAgreementsSubscription) this.getEmployeeWithAgreementsSubscription.unsubscribe();
    if (this.passwordUpdateSubscrption) this.passwordUpdateSubscrption.unsubscribe();
  }

  preparePasswordForm() {
    this.passwordChangeSuccess = null;
    this.passwordChangeFailure = null;
  }

  updatePassword(newPass: string){
    if (!!newPass) {
      if (newPass != '') {
        this.requstStarted = true;
        this.passwordUpdateSubscrption = this.employeeService.changePass(this.employee.id, newPass).subscribe(response => {
          this.requstStarted = false;
          this.passwordChangeSuccess = 'הסיסמה עודכנה בהצלחה';
        }, e=> {
          this.passwordChangeFailure = e;
        });
      }
    }
  }
}
