import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from "@angular/core";
import {Department} from "../../model/department";
import {DepartmentService} from "../service/department.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SessionStorageService} from "ng2-webstorage";
import {Subscription} from "rxjs/Subscription";
import {ArraySortPipe} from "../../pipe/array-sort.pipe";

@Component({
  selector: 'department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.css']
})
export class DepartmentFormComponent implements OnInit, OnChanges, OnDestroy {

  department: Department;
  departments: Department[] = [];
  @Output() departmentChoose: EventEmitter<number> = new EventEmitter();
  private departmentCreationForm: FormGroup;
  private errorDepartment: string;
  private upsertDepartmentSubscription: Subscription;
  private getDepartmentsSubscription: Subscription;


  constructor(private departmentService: DepartmentService,
              private localSt: SessionStorageService,
              private arrSortPipe: ArraySortPipe,
              private _fb: FormBuilder) {
    this.department = new Department();
  }

  ngOnInit(): void {
    this.getDepartments();
    this.fillTheForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['departments']) {
    //   this.departments = changes['departments'].currentValue;
    //   this.fillTheForm();
    // }
  }

  ngOnDestroy(): void {
    if (this.getDepartmentsSubscription) this.getDepartmentsSubscription.unsubscribe();
    if (this.upsertDepartmentSubscription) this.upsertDepartmentSubscription.unsubscribe();
  }

  emitChosenDepartment(departmentId?: number) {
    this.departmentChoose.emit(departmentId);
  }

  private fillTheForm() {
    if (this.department.name == null) {
      this.fillTheCreationForm();
    } else {
      this.fillTheEditingForm();
    }
  }

  private fillTheCreationForm() {
    this.departmentCreationForm = this._fb.group({
      name: ['', [Validators.required]],
    });
  }

  private fillTheEditingForm() {
    let name = this.department.name;
    this.departmentCreationForm = this._fb.group({
      name: [name, [Validators.required]]
    });
  }

  submitDepartmentForm(department: any) {
    let value = department.value;
    this.department.name = value.name;
    this.upsertDepartmentSubscription = this.departmentService.save(this.department).subscribe(responseDepartment => {
      let closeNewDepartmentFormButton = document.getElementById("closeNewDepartmentFormButton");
      if (closeNewDepartmentFormButton) {
        closeNewDepartmentFormButton.click();
      }
      let closeEditDepartmentFormButton = document.getElementById("closeEditDepartmentFormButton");
      if (closeEditDepartmentFormButton) {
        closeEditDepartmentFormButton.click();
      }
      let isNew = this.department.id == null;
      if (isNew) {
        this.departments.push(responseDepartment);
      } else {
        this.departments.forEach(dep => {
          if (dep.id == responseDepartment.id) {
            dep.name = responseDepartment.name;
            return;
          }
        });
      }
      this.departments = this.arrSortPipe.transform(this.departments, 'name');
      this.department = new Department();
      this.localSt.store('formDepartment', JSON.stringify({
        isNew: isNew,
        dep: responseDepartment
      }));
    }, error => this.errorDepartment = error);
  }

  private getDepartments() {
    this.getDepartmentsSubscription = this.departmentService.getAll().subscribe(departments => {
      this.departments = departments;
    });
  }

  openDepartmentEditingMenu(department: Department) {
    this.department = department;
    this.fillTheEditingForm();
    let openDepartmentFormElem = document.getElementById('openDepartmentFormElem');
    if (openDepartmentFormElem) {
      openDepartmentFormElem.click();
    }
    return false;
  }
}
