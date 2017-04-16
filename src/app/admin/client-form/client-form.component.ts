import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Client} from "../../model/client";
import {SessionStorageService} from "ng2-webstorage";
import {ClientService} from "../service/client.service";
import {Address} from "../../model/address";

@Component({
  selector: 'client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit, OnChanges{

  @Input() private clientForCreation: Client;
  public clientCreationForm: FormGroup;
  private errorClient: string;

  constructor(private clientService: ClientService,
              private localSt: SessionStorageService,
              private _fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.fillTheForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // only run when property "data" changed
    if (changes['clientForCreation']) {
      this.clientForCreation = changes['clientForCreation'].currentValue;
      this.fillTheForm();
    }
  }

  private fillTheForm() {
    if (this.clientForCreation == null || this.clientForCreation.name==null) {
      this.fillTheCreationForm();
    } else {
      this.fillTheEditingForm();
    }
  }

  private fillTheEditingForm() {
    this.populateClient(this.clientForCreation);
  }

  private fillTheCreationForm() {
    this.clientForCreation = new Client();
    this.clientCreationForm = this._fb.group({
      name: ['', [Validators.required]],
      companyNumber: ['', [Validators.required]],
      phones: this._fb.array(['']),
      addresses: this._fb.array([
        this.initAddress(),
      ])
    });
  }

  submitForm(client: any) {
    let value = client.value;
    this.clientForCreation.name = value.name;
    this.clientForCreation.companyNumber = value.companyNumber;
    this.clientForCreation.addresses = value.addresses;
    this.clientForCreation.phones = value.phones;
    this.clientService.save(this.clientForCreation).subscribe(client => {
      document.getElementById("closeNewClientFormButton").click();
      document.getElementById("closeEditClientFormButton").click();
      this.localSt.store('formClient', JSON.stringify({isNew: this.clientForCreation.id==null, client: client}));
      this.errorClient = '';
      // this.myForm.reset();
    }, error => this.errorClient = error);
  }

  private populateClient(client) {
    this.clientCreationForm = this._fb.group({
      name: [client.name, [Validators.required]],
      companyNumber: [client.companyNumber, [Validators.required]],
      phones: this._fb.array(client.phones),
      addresses: this._fb.array([])
    });
    const control = <FormArray>this.clientCreationForm.controls['addresses'];
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
    const control = <FormArray>this.clientCreationForm.controls['addresses'];
    control.push(this.initAddress());
  }

  addPhone() {
    // add address to the list
    const control = <FormArray>this.clientCreationForm.controls['phones'];
    control.push(new FormControl(''));
  }

  removeAddress(i: number) {
    // remove address from the list
    const control = <FormArray>this.clientCreationForm.controls['addresses'];
    control.removeAt(i);
  }

  removePhones(i: number) {
    // remove address from the list
    const control = <FormArray>this.clientCreationForm.controls['phones'];
    control.removeAt(i);
  }

}
