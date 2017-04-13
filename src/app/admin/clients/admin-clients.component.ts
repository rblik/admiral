import {Component, OnInit} from "@angular/core";
import {ClientService} from "../service/client.service";
import {ProjectService} from "../service/project.service";
import {Client} from "../../model/client";
import {Project} from "../../model/project";
import {ActivatedRoute, Router} from "@angular/router";
import {Validators, FormGroup, FormArray, FormBuilder, FormControl} from '@angular/forms';

@Component({
  selector: 'admin-clients',
  templateUrl: './admin-clients.component.html',
  styleUrls: ['./admin-clients.component.css']
})
export class AdminClientsComponent implements OnInit {
  private clients: Client[];
  private clientsUi: Client[];
  private projects: Project[];
  private clientForCreation: Client;
  private error: string;
  public myForm: FormGroup;

  constructor(private clientService: ClientService,
              private projectService: ProjectService,
              private router: Router,
              private route: ActivatedRoute,
              private _fb: FormBuilder) {
    this.clientForCreation = new Client();

  }

  ngOnInit(): void {
    this.getClients();
    this.getProjects();
    this.myForm = this._fb.group({
      name: ['', [Validators.required]],
      companyNumber: ['', [Validators.required]],
      phones: this._fb.array(['']),
      addresses: this._fb.array([
        this.initAddress(),
      ])
    });
  }


  getClients() {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
      this.clientsUi = clients;
    }, error => {
      this.error = error;
    });
  }

  getProjects() {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    }, error => {
      this.error = error;
    });
  }

  createNew(client: any) {
    let value = client.value;
    console.log(value);
    this.clientForCreation.name = value.name;
    this.clientForCreation.companyNumber = value.companyNumber;
    this.clientForCreation.addresses = value.addresses;
    this.clientForCreation.phones = value.phones;
    document.getElementById("closeButton").click();
    this.clientService.save(this.clientForCreation).subscribe(client => {
      this.clientsUi.push(client);
    });
  }

  search(clientId: string) {
    this.clientsUi = this.clients.filter(function (client) {
      return client.name.toLowerCase().match(clientId.toLowerCase());
    });
  }

  toDetail(clientId: number) {
    this.router.navigate([clientId], {relativeTo: this.route});
  }


  // client creation
  initAddress() {
    // initialize our address
    return this._fb.group({
      area: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: [''],
    });
  }

  addAddress() {
    // add address to the list
    const control = <FormArray>this.myForm.controls['addresses'];
    control.push(this.initAddress());
  }

  addPhone() {
    // add address to the list
    const control = <FormArray>this.myForm.controls['phones'];
    control.push(new FormControl(''));
  }

  removeAddress(i: number) {
    // remove address from the list
    const control = <FormArray>this.myForm.controls['addresses'];
    control.removeAt(i);
  }

  removePhones(i: number) {
    // remove address from the list
    const control = <FormArray>this.myForm.controls['phones'];
    control.removeAt(i);
  }
}
