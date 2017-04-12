import {Component, OnInit} from "@angular/core";
import {ClientService} from "../service/client.service";
import {ProjectService} from "../service/project.service";
import {Client} from "../../model/client";
import {Project} from "../../model/project";

@Component({
  selector: 'admin-clients',
  templateUrl: './admin-clients.component.html',
  styleUrls: ['./admin-clients.component.css']
})
export class AdminClientsComponent implements OnInit{
  private clients: Client[];
  private projects: Project[];
  private error: string;

  constructor(private clientService: ClientService, private projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.getClients();
    this.getProjects();
  }

  getClients(){
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    }, error => {
      this.error = error;
    });
  }

  getProjects(){
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    }, error => {
      this.error = error;
    });
  }

}
