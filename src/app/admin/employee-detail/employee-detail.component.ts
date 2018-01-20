import {Component, OnDestroy, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Params} from "@angular/router";
import {EmployeeService} from "../service/employee.service";
import {Observable} from "rxjs/Observable";
import {AgreementDto} from "../../model/agreement-dto";
import {AgreementService} from "../service/agreement.service";
import {Subscription} from "rxjs/Subscription";
import {ProjectService} from "../service/project.service";
import {Project} from "../../model/project";
import {Client} from "../../model/client";
import {SelectItem} from "primeng/primeng";
import {ArraySortPipe} from "../../pipe/array-sort.pipe";
import {FormGroup} from "@angular/forms";
import {Agreement} from "../../model/agreement";
import {Tariff} from "../../model/tariff";
@Component({
  selector: 'employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy{
  private employee: Employee;
  private agreements: AgreementDto[];
  private agreementsEn: AgreementDto[];
  private agreementsDis: AgreementDto[];
  private currenciesUi:SelectItem[] = [];
  private tariffTypesUi:SelectItem[] = [];
  private projectsGl:Project[];
  private projectsUi:Project[];
  private clientsUi:Client[];
  private chosenProject:number;
  private chosenClient: any;
  private clientsDropdown: SelectItem[] = [];
  private projectsDropdown: SelectItem[] = [];
  private selectedHoursCounting:string;
  private selectedCurrency:string;
  private selectedCurrencyAmount:number;
  private errorMessage:string;
  private isError:boolean=false;

  private requstStarted: boolean;
  private passwordChangeSuccess: any;
  private passwordChangeFailure: any;
  private getEmployeeWithAgreementsSubscription: Subscription;
  private passwordUpdateSubscrption: Subscription;
  private showEnabled: boolean=true;

  constructor(private employeeService: EmployeeService, private agreementService: AgreementService, private route: ActivatedRoute, private projectService:ProjectService,private arrSortPipe: ArraySortPipe) {
  }

  ngOnInit(): void {
    this.getEmployeeWithAgreementsSubscription = this.route.params.map((params: Params) => params['employeeId']).switchMap((employeeId: number) => {
      return Observable.forkJoin([this.employeeService.get(employeeId), this.agreementService.getAgreementsByEmployee(employeeId)]);
    }).catch(e => Observable.throw(e.json().details[0]))
      .subscribe(([employee, agreements]) => {
        this.employee = employee;
        this.agreements = agreements;
        this.reInitWorkAgreements();

      });
    this.projectService.getEnabledProjects().subscribe(res=>
      this.projectsGl=res,
      err=>console.log(err)
    )
    this.fillDropDowns();
  }

  ngOnDestroy(): void {
    if (this.getEmployeeWithAgreementsSubscription) this.getEmployeeWithAgreementsSubscription.unsubscribe();
    if (this.passwordUpdateSubscrption) this.passwordUpdateSubscrption.unsubscribe();
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

  showError(message:string){
    this.errorMessage=message;
    this.isError=true;
    setTimeout(()=>{this.isError=false}, 3000);
  }

  preparePasswordForm() {
    this.passwordChangeSuccess = null;
    this.passwordChangeFailure = null;
  }

  disableEmployeeFromProject(agreementId:number){
    this.agreementService.remove(agreementId).subscribe()
    this.refreshProjectsSublistAfterDisable(agreementId)
    this.reInitWorkAgreements();

  }

  submitAdditionToProject(){

    if(!!this.chosenProject&&!!this.chosenClient&&!!this.selectedCurrencyAmount&&!!this.selectedCurrency&&!!this.selectedHoursCounting) {
      var agrTemp = new Agreement;
      var tariffTemp = new Tariff;
      tariffTemp.amount = this.selectedCurrencyAmount;
      tariffTemp.type = this.selectedHoursCounting;
      tariffTemp.currency = this.selectedCurrency;
      agrTemp.tariff = tariffTemp;
      agrTemp.active = true;
      this.agreementService.save(this.employee.id, this.chosenProject, agrTemp).subscribe(
        res => {
          this.agreementService.getAgreementsByEmployee(this.employee.id).subscribe(
            res => {
              this.agreements = res;
              this.reInitWorkAgreements();
            }
          )
        }
      )
      document.getElementById("additionToProjectCloseButton").click();
    }
    else this.showError("מלא את כל הפרטים")

  }

  openAddToProjectDialog(){
    document.getElementById("addEmployeeToProjectButton").click();
    this.initClientsDropDown();
    this.initProjectsDropDown();
    this.fillClientsDropDown();
    this.fillProjectsDropDown();
    this.selectedCurrency='SHEKEL';
    this.selectedHoursCounting='HOUR';
    this.chosenClient=null;
    this.chosenProject=null;
    this.selectedCurrencyAmount=null;
  }

  fillClientsDropDown(){
      this.projectsGl.forEach(
        prj=> {
          if(this.isNewItem(prj.client.id, this.clientsDropdown)){
            this.clientsDropdown.push(
              {
                label: prj.client.name,
                value: prj.client.id
              })}})
  }

  fillProjectsDropDown(){
    console.log(this.chosenClient)
    if(!!this.chosenClient){
      this.projectsGl.forEach(
        prj=>{
          if(prj.client.id==this.chosenClient){
            this.projectsDropdown.push(
              {
                label: prj.name,
                value: prj.id
              }
            )
          }
        }
      )}
    else {
      this.projectsGl.forEach(
        prj=> {
            this.projectsDropdown.push(
              {
                label: prj.name,
                value: prj.id
              }

            )
        })
    }
  }

  isNewItem(clientId:number, items:SelectItem[]):boolean{
    var count=0;
    items.forEach(itm=>{
      if(itm.value==clientId){
        count++;
      }
    })
    if(count>0) return false
    else return true
  }

  enableEmployeeInProject(agreementId:number){
    this.agreementService.enable(agreementId).subscribe()
    this.refreshProjectsSublistAfterEnable(agreementId)
    this.reInitWorkAgreements();
  }

  updateDropDowns(){
    this.projectsDropdown=[]
    this.clientsDropdown=[]
    this.initProjectsDropDown()
    this.initClientsDropDown()
    this.fillProjectsDropDown()
    this.fillClientsDropDown()
  }

  refreshProjectsSublistAfterDisable(agreementId:number){
    var tempAgreements = this.agreements
    var outAgreements=[];
    tempAgreements.forEach(agr=>{
      if(agr.agreementId==agreementId){
        var tmp=agr
        tmp.active=false
        outAgreements.push(tmp)
      }
     else {outAgreements.push(agr)}
    })
    this.agreements=outAgreements
  }

  getClient(projectId: number) {
    if (!projectId) this.chosenClient = null;
    else {
      this.chosenClient = null;
      let filter = this.projectsGl.filter(function (proj) {
        return projectId != null ? proj.id === projectId : true;
      });
      this.chosenClient = filter[0].client.id;
    }
  }

  getProjectsUi(clientId: number) {
    let buff = [];
    let arrAgreemId = [];
    let filter = this.projectsGl.filter(function (projDr) {
      return projDr != null ? projDr.client.id === clientId : true;
    });
    filter.forEach(proj => {
      if (arrAgreemId.indexOf(proj.id) == -1) {
        buff.push({
          label: proj.name,
          value: proj.id
        });
        arrAgreemId.push(proj.id);
      }
    });
    this.arrSortPipe.transform(buff, "label");
    this.projectsDropdown = this.projectsDropdown.slice(0,1).concat(buff);
    // this.chosenAgreement = null;

  }

  refreshProjectsSublistAfterEnable(agreementId:number){
    var tempAgreements = this.agreements
    var outAgreements=[];
    tempAgreements.forEach(agr=>{
      if(agr.agreementId==agreementId){
        var tmp=agr;
        tmp.active=true;
        outAgreements.push(tmp)
      }
      else {outAgreements.push(agr)}
    })
    this.agreements=outAgreements
  }
  toggleEnabledOnlyView(){
    this.showEnabled=!this.showEnabled;
  }

  reInitWorkAgreements(){
    var tempEn=[];
    var tempDis=[];
    this.agreements.forEach(agr=>{
      if(agr.active){
        tempEn.push(agr)
      }
      else tempDis.push(agr)
    })
    this.agreementsEn=tempEn;
    this.agreementsDis=tempDis;
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

  private initClientsDropDown() {
    this.clientsDropdown = [];
    this.clientsDropdown.push({label: "בחר לקוח", value: null});
  }
  private initProjectsDropDown() {
    this.projectsDropdown = [];
    this.projectsDropdown.push({label: "בחר פרויקט", value: null});
  }

}
