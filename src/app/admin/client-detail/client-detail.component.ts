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

  updateClient(client: any) {
    let value = client.value;
    this.client.name = value.name;
    this.client.companyNumber = value.companyNumber;
    this.client.addresses = value.addresses;
    this.client.phones = value.phones;
    this.clientService.save(this.client).subscribe(updated => {
      this.localSt.store('editedClient', JSON.stringify({id: updated.id, name: updated.name}));
      document.getElementById("closeButton").click();
      this.errorClient = '';
    }, error => this.errorClient = error);
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
