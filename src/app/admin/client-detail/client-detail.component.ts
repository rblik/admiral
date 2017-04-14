import {Component, OnInit} from "@angular/core";
import {ClientService} from "../service/client.service";
import {ProjectService} from "../service/project.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Client} from "../../model/client";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Address} from "../../model/address";

@Component({
  selector: 'client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {

  private client: Client;
  public myFormEdit: FormGroup;
  private errorClient: string;


  constructor(private clientService: ClientService, private _fb: FormBuilder, private projectService: ProjectService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.initClient();
    this.route.params.switchMap((params: Params) =>
      this.clientService.get(params['clientId'])).
    subscribe(client => {
      this.client = client;
      this.populateClient(client);
    });
  }

  private populateClient(client) {
    this.myFormEdit = this._fb.group({
      name: [client.name, [Validators.required]],
      companyNumber: [client.companyNumber, [Validators.required]],
      phones: this._fb.array(client.phones),
      addresses: this._fb.array([])
    });
    const control = <FormArray>this.myFormEdit.controls['addresses'];
    client.addresses.forEach(address => {
      control.push(this.populateAddresses(address));
    });
  }

  private populateAddresses(address: Address): FormGroup {
    return this._fb.group({
      id: address.id,
      area: [address.area, Validators.required],
      city: [address.city, Validators.required],
      street: [address.street, Validators.required],
      houseNumber: [address.houseNumber],
    });
  }

  private initClient() {
    this.myFormEdit = this._fb.group({
      name: ['', [Validators.required]],
      companyNumber: ['', [Validators.required]],
      phones: this._fb.array(['']),
      addresses: this._fb.array([
        this.initAddress()
      ])
    });
  }

  updateClient(client: any) {
    let value = client.value;
    console.log(value);
    this.client.name = value.name;
    this.client.companyNumber = value.companyNumber;
    this.client.addresses = value.addresses;
    this.client.phones = value.phones;
    this.clientService.save(this.client).subscribe(client => {
      document.getElementById("closeButton").click();
      this.errorClient = '';
    }, error => this.errorClient = error);
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
    const control = <FormArray>this.myFormEdit.controls['addresses'];
    control.push(this.initAddress());
  }

  addPhone() {
    // add address to the list
    const control = <FormArray>this.myFormEdit.controls['phones'];
    control.push(new FormControl(''));
  }

  removeAddress(i: number) {
    // remove address from the list
    const control = <FormArray>this.myFormEdit.controls['addresses'];
    control.removeAt(i);
  }

  removePhones(i: number) {
    // remove address from the list
    const control = <FormArray>this.myFormEdit.controls['phones'];
    control.removeAt(i);
  }
}
