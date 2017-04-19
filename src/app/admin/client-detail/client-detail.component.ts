import {Component, OnInit} from "@angular/core";
import {ClientService} from "../service/client.service";
import {ProjectService} from "../service/project.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Client} from "../../model/client";
import {Project} from "../../model/project";
import {SessionStorageService} from "ng2-webstorage";

@Component({
  selector: 'client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {

  private client: Client;
  private errorClient: string;
  private errorProject: string;
  private formProject: Project;
  public displayFormProjectDialog: boolean;
  private labelForProjectPopup: string;


  constructor(private clientService: ClientService, private localSt: SessionStorageService, private projectService: ProjectService, private route: ActivatedRoute) {
    this.formProject = new Project();
  }

  ngOnInit(): void {
    this.route.params.switchMap((params: Params) =>
      this.clientService.get(params['clientId'])).subscribe(client => {
      this.client = client;
    });
  }

  popupEdit(project: Project) {
    this.labelForProjectPopup = 'עריכת פרויקט';
    this.formProject = new Project();
    this.formProject.name = project.name;
    this.formProject.id = project.id;
    this.displayFormProjectDialog = true;
  }

  popupCreate() {
    this.labelForProjectPopup = 'יצירת פרןיקט';
    this.formProject = new Project();
    this.displayFormProjectDialog = true;
  }

  updateOrCreateProject(project: Project) {
    this.projectService.save(this.client.id, project).subscribe(updated => {
      this.formProject = new Project();
      this.displayFormProjectDialog = false;
      if (project.id == null) {
        if (this.client.projects == null) this.client.projects = [];
        this.client.projects.push(updated);
      } else this.client.projects.forEach(value => {
        if (value.id == project.id) {
          value.name = project.name;
          return;
        }
      });
    }, error => this.errorProject = error);
  }
}
