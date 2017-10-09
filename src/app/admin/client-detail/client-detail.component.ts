import {Component, OnDestroy, OnInit} from "@angular/core";
import {ClientService} from "../service/client.service";
import {ProjectService} from "../service/project.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Client} from "../../model/client";
import {Project} from "../../model/project";
import {Tariff} from "../../model/tariff";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SelectItem} from "primeng/primeng";
import {Agreement} from "../../model/agreement";
import {Subscription} from "rxjs/Subscription";
import {AgreementService} from "../service/agreement.service";

@Component({
  selector: 'client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  private upsertProjectSubscription: Subscription;
  private routeParamsSubscription: Subscription;

  private client: Client;
  private errorClient: string;
  private errorProject: string;

  private projectCreationForm: FormGroup;
  private formProject: Project;
  public displayFormProjectDialog: boolean;
  private labelForProjectPopup: string;

  private agreement: Agreement;
  private clientName: string;
  private checkedEnabledProject:boolean


  private tariffTypesUi: SelectItem[] = [];
  private currenciesUi: SelectItem[] = [];
  private project: Project;
  private projectForRemove: Project;
  private displayRemoveProjectDialog: boolean;
  private agreementForRemove: Agreement;

  constructor(private clientService: ClientService,
              private _fb: FormBuilder,
              private projectService: ProjectService,
              private agreementService: AgreementService,
              private route: ActivatedRoute) {
    this.formProject = new Project();
    this.fillCreationForm();
    this.fillDropDowns();
    this.initAgreementForEdition();
  }

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.switchMap((params: Params) =>
      this.clientService.get(params['clientId'])).subscribe(client => {
      this.client = client;
      this.clientName = client.name;
    });
  }

  syncClient(client) {
    var projects= this.client.projects;
    var cliTemp=client;
    cliTemp.projects=projects;
    this.client = cliTemp;
  }

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) this.routeParamsSubscription.unsubscribe();
    if (this.upsertProjectSubscription) this.upsertProjectSubscription.unsubscribe();
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

  private fillCreationForm() {
    this.projectCreationForm = this._fb.group({
      id: [],
      name: [, [Validators.required]],
      enabled:[true],
      tariff: this._fb.group({
        id: [],
        amount: [, [Validators.required]],
        currency: ['SHEKEL', [Validators.required]],
        type: ['HOUR', [Validators.required]],
      })
    });
  }

  private fillEditingForm(project: Project) {
    console.log("filling")
    console.log(project)
    this.projectCreationForm = this._fb.group({
      id: [project.id],
      name: [project.name, [Validators.required]],
      enabled: [project.isEnabled],
      tariff: this._fb.group({
        id: [project.tariff.id],
        amount: [project.tariff.amount, [Validators.required]],
        currency: [project.tariff.currency, [Validators.required]],
        type: [project.tariff.type, [Validators.required]],
      })
    });
  }

  check(checked:Boolean){
    if(checked)this.formProject.isEnabled=true
    else this.formProject.isEnabled=false
  }

  popupEdit(project: Project) {
    this.labelForProjectPopup = 'עריכת פרויקט';
    this.formProject = new Project();
    this.formProject.name = project.name;
    this.formProject.id = project.id;
    this.formProject.isEnabled=project.isEnabled;
    this.formProject.tariff = new Tariff();
    this.formProject.tariff.id = project.tariff.id;
    this.formProject.tariff.amount = project.tariff.amount;
    this.formProject.tariff.currency = project.tariff.currency;
    this.formProject.tariff.type = project.tariff.type;
    this.fillEditingForm(this.formProject);
    let openProjForm = document.getElementById('openProjectFormElem');
    if (openProjForm) {
      openProjForm.click();
    }
  }

  popupDeleteAgreement(proj: Project, agreem: Agreement) {
    this.agreementForRemove = agreem;
    this.projectForRemove = proj;
    let removeAgreementForm = document.getElementById('removeAgreementFormElem');
    if (removeAgreementForm) {
      removeAgreementForm.click();
    }
  }

  submitRemoveProject() {
    this.projectService.remove(this.projectForRemove.id).subscribe(success => {
    });
    this.client.projects.forEach((proj, index) => {
      if (proj.id == this.projectForRemove.id) {
        this.client.projects.splice(index, 1);
        return;
      }
    });
    if (this.client.projects.length === 0) {
      this.client.projects = null;
    }
    this.projectForRemove = null;
    let removeProjForm = document.getElementById('closeProjectRemoveElem');
    if (removeProjForm) {
      removeProjForm.click();
    }
  }

  submitRemoveAgreement() {
    this.agreementService.remove(this.agreementForRemove.id).subscribe(success => {
    });
    this.projectForRemove.workAgreements.forEach((agreement, index) => {
      if (agreement.id == this.agreementForRemove.id) {
        this.projectForRemove.workAgreements.splice(index, 1);
        return;
      }
    });
    this.agreementForRemove = null;
    this.projectForRemove = null;
    let removeProjForm = document.getElementById('closeAgreementRemoveElem');
    if (removeProjForm) {
      removeProjForm.click();
    }
  }

  popupCreate() {
    this.labelForProjectPopup = 'פרויקט חדש';
    this.formProject = new Project();
    this.formProject.tariff = new Tariff();
    this.fillCreationForm();
    let openProjForm = document.getElementById('openProjectFormElem');
    if (openProjForm) {
      openProjForm.click();
    }
  }

  updateOrCreateProject(project: any) {
    let value = project.value;
    this.upsertProjectSubscription = this.projectService.save(this.client.id, value).subscribe(updated => {
      this.formProject = new Project();
      let closeProjForm = document.getElementById('closeProjectFormElem');
      if (closeProjForm) {
        closeProjForm.click();
      }
      if (value.id == null) {
        if (this.client.projects == null) this.client.projects = [];
        this.client.projects.push(updated);
      } else this.client.projects.forEach(proj => {
        if (proj.id == value.id) {
          console.log("updating")
          console.log(value)
          proj.isEnabled=value.enabled
          proj.name = value.name;
          proj.tariff = value.tariff;
          return;
        }
      });
    }, error => this.errorProject = error);
  }

  popupCreateAgreement(project: Project) {
    this.project = project;
    this.initAgreementForEdition();
    let projectEmployeeFormOpen = document.getElementById('projectEmployeeFormOpen');
    if (projectEmployeeFormOpen != null) {
      projectEmployeeFormOpen.click();
    }
  }

  popupEditAgreement(project: Project, agreement: Agreement) {
    this.project = project;
    this.agreement = agreement;
    let projectEmployeeFormOpen = document.getElementById('projectEmployeeFormOpen');
    if (projectEmployeeFormOpen != null) {
      projectEmployeeFormOpen.click();
    }
  }

  private initAgreementForEdition() {
    this.agreement = new Agreement();
    this.agreement.tariff = new Tariff();
  }
}
