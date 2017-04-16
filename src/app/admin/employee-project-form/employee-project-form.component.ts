import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {ProjectService} from "../service/project.service";
import {SelectItem} from "primeng/primeng";
import {Project} from "../../model/project";
import {AgreementService} from "../service/agreement.service";
import {Client} from "../../model/client";

@Component({
  selector: 'employee-project-form',
  templateUrl: './employee-project-form.component.html',
  styleUrls: ['./employee-project-form.component.css']
})
export class EmployeeProjectForm implements OnInit, OnChanges {

  @Input() employeeId: number;
  @Output() addedProject: EventEmitter<Project> = new EventEmitter<Project>();
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

  addProject(project: Project) {
    this.agreementService.save(this.employeeId, project.id).subscribe(agreement => {
      document.getElementById('closeEmployeeProjectForm').click();
      this.addedProject.emit(project);
    },
    error => this.errorProject = error);
  }

}
