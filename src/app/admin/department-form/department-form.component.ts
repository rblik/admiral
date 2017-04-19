import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {Department} from "../../model/department";
import {DepartmentService} from "../service/department.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SessionStorageService} from "ng2-webstorage";
@Component({
  selector: 'department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.css']
})
export class DepartmentFormComponent implements OnInit, OnChanges {

  department: Department;
  departments: Department[] = [];
  @Output() departmentChoose: EventEmitter<number> = new EventEmitter();
  private departmentCreationForm: FormGroup;
  private errorDepartment: string;


  constructor(private departmentService: DepartmentService,
              private localSt: SessionStorageService,
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
    this.departmentService.save(this.department).subscribe(responseDepartment => {
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
      this.department = new Department();
      this.localSt.store('formDepartment', JSON.stringify({
        isNew: isNew,
        dep: responseDepartment
      }));
    }, error => this.errorDepartment = error);
  }

  private getDepartments() {
    this.departmentService.getAll().subscribe(departments => {
      this.departments = departments;
    })
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
