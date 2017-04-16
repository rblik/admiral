import {Component, OnInit} from "@angular/core";
import {ClientService} from "../service/client.service";
import {Client} from "../../model/client";
import {ActivatedRoute, Router} from "@angular/router";
import {Validators, FormGroup, FormArray, FormBuilder, FormControl} from '@angular/forms';
import {SessionStorageService} from "ng2-webstorage";

@Component({
  selector: 'admin-clients',
  templateUrl: './admin-clients.component.html',
  styleUrls: ['./admin-clients.component.css']
})
export class AdminClientsComponent implements OnInit {
  private clients: Client[];
  private clientsUi: Client[];
  private clientForCreation: Client;
  private errorClients: string;

  constructor(private clientService: ClientService,
              private router: Router,
              private localSt: SessionStorageService,
              private route: ActivatedRoute,
              private _fb: FormBuilder) {
    this.clientForCreation = new Client();

  }

  ngOnInit(): void {
    this.getClients();
    this.subscribeOnEditedClient();
  }

  private subscribeOnEditedClient() {
    this.localSt.observe('formClient').subscribe(edited => {
      let editedClient = JSON.parse(edited);
      if (editedClient.isNew) {
        this.clientsUi.push(editedClient.client);
      } else {
        this.clientsUi.forEach(client => {
          if (client.id.toString() == editedClient.client.id.toString()) {
            client.name = editedClient.client.name;
            return;
          }
        });
      }
    });
  }

  getClients() {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
      this.clientsUi = clients;
    }, error => {
      this.errorClients = error;
    });
  }

  search(value: string) {
    this.clientsUi = this.clients.filter(function (client) {
      return client.name.toLowerCase().match(value.toLowerCase());
    });
  }

  toDetail(clientId: number) {
    this.router.navigate([clientId], {relativeTo: this.route});
  }
}
