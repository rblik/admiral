import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from "@angular/core";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Client} from "../../model/client";
import {SessionStorageService} from "ng2-webstorage";
import {ClientService} from "../service/client.service";
import {Address} from "../../model/address";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit, OnChanges, OnDestroy{

  @Input() private clientForCreation: Client;
  @Output() outputClient: EventEmitter<Client> = new EventEmitter<Client>();
  public clientCreationForm: FormGroup;
  private errorClient: string;
  private upsertClientSubscription: Subscription;

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

  ngOnDestroy(): void {
    if (this.upsertClientSubscription) this.upsertClientSubscription.unsubscribe();
  }

  private fillTheForm() {
    if (this.isCreate()) {
      this.fillTheCreationForm();
    } else {
      this.fillTheEditingForm();
    }
  }

  private isCreate() {
    return this.clientForCreation == null || this.clientForCreation.name == null;
  }

  private fillTheEditingForm() {
    this.populateClient(this.clientForCreation);
  }

  private fillTheCreationForm() {
    this.clientForCreation = new Client();
    this.clientCreationForm = this._fb.group({
      name: ['', [Validators.required]],
      companyNumber: [''],
      clientNumber: [''],
      phones: this._fb.array([]),
      addresses: this._fb.array([])
    });
  }

  submitForm(clientSubmitted: any) {
    let value = clientSubmitted.value;
    value.id = this.clientForCreation.id;
    // this.clientForCreation.name = value.name;
    // this.clientForCreation.companyNumber = value.companyNumber;
    // this.clientForCreation.clientNumber = value.clientNumber;
    // this.clientForCreation.addresses = value.addresses;
    // this.clientForCreation.phones = value.phones;
    this.upsertClientSubscription = this.clientService.save(value).subscribe(client => {
      this.outputClient.emit(client);
      let closeNewClientFormButton = document.getElementById("closeNewClientFormButton");
      if (closeNewClientFormButton) {
        closeNewClientFormButton.click();
      }
      let closeEditClientFormButton = document.getElementById("closeEditClientFormButton");
      if (closeEditClientFormButton) {
        closeEditClientFormButton.click();
      }
      this.localSt.store('formClient', JSON.stringify({isNew: this.clientForCreation.id==null, client: client}));
      this.errorClient = '';
      // this.myForm.reset();
    }, error => this.errorClient = error);
  }

  private populateClient(client) {
    this.clientCreationForm = this._fb.group({
      name: [client.name, [Validators.required]],
      companyNumber: [client.companyNumber],
      clientNumber: [client.clientNumber],
      phones: this._fb.array(!!client.phones? client.phones: []),
      addresses: this._fb.array([])
    });
    const control = <FormArray>this.clientCreationForm.controls['addresses'];
    if (!!client.addresses) {
      client.addresses.forEach(address => {
        control.push(this.populateAddresses(address));
      });
    }
  }

  private populateAddresses(address: Address): FormGroup {
    return this._fb.group({
      id: address.id,
      area: [address.area],
      city: [address.city],
      street: [address.street],
      houseNumber: [address.houseNumber],
    });
  }

  // client creation
  initAddress() {
    // initialize our address
    return this._fb.group({
      area: [''],
      city: [''],
      street: [''],
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
