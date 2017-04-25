import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {ProjectService} from "../service/project.service";
import {SelectItem} from "primeng/primeng";
import {Project} from "../../model/project";
import {AgreementService} from "../service/agreement.service";
import {Client} from "../../model/client";
import {Agreement} from "../../model/agreement";

@Component({
  selector: 'employee-project-form',
  templateUrl: './employee-project-form.component.html',
  styleUrls: ['./employee-project-form.component.css']
})
export class EmployeeProjectFormComponent implements OnInit, OnChanges {

  @Input() employeeId: number;
  @Output() addedAgreement: EventEmitter<Agreement> = new EventEmitter<Agreement>();
  private startDate: Date;
  private finishDate: Date;
  private errorProject: string;
  private chosenProject: Project;
  private projectsUi: SelectItem[] = [];
  private projects: Project[] = [];
  private clientsUi: SelectItem[] = [];
  private chosenClient: Client;
  private errorProjects: string;

  constructor(private projectService: ProjectService, private agreementService: AgreementService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeeId']) {
      this.employeeId = changes['employeeId'].currentValue;
    }
  }

  ngOnInit(): void {
    this.chosenProject = null;
    this.chosenClient = null;
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
      this.initClients();
      this.initProjects(null);
    }, error => this.errorProjects = error);
  }

  initClients() {
    let arr = [];
    this.clientsUi.push({label: "בחר לקוח", value: null});
    this.projects.forEach(project => {
      if (arr.indexOf(project.client.id) == -1) {
        this.clientsUi.push({
          label: project.client.name,
          value: project.client
        });
        arr.push(project.client.id);
      }
    });
  }

  initProjects(client: any) {
    this.projectsUi = [];
    this.projectsUi.push({label: "בחר פרויקט", value: null});
    let filtered = client == null ? this.projects : this.projects.filter(function (proj) {
      return proj.client.id.toString() === client.id.toString();
    });
    filtered.forEach(project => {
      this.projectsUi.push({
        label: project.name,
        value: project
      });
    });
  }

  addProject(startDate: Date, finishDate: Date, project: Project) {
    this.agreementService.save(this.employeeId, project.id, startDate, finishDate).subscribe(agreement => {
        document.getElementById('closeEmployeeProjectForm').click();
        agreement.employeeId = this.employeeId;
        agreement.projectId = project.id;
        agreement.projectName = project.name;
        agreement.clientId = project.client.id;
        agreement.clientName = project.client.name;
        this.addedAgreement.emit(agreement);
      },
      error => this.errorProject = error);
  }

}
