import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {Department} from "../../model/department";
import {DepartmentService} from "../service/department.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
@Component({
  selector: 'department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.css']
})
export class DepartmentFormComponent implements OnInit, OnChanges{

  department: Department;
  @Input() departments: Department[] = [];
  @Output() persistedDepartment: EventEmitter<any> = new EventEmitter();
  @Output() departmentChoose: EventEmitter<number> = new EventEmitter();
  private departmentCreationForm: FormGroup;
  private errorDepartment: string;


  constructor(private departmentService: DepartmentService,
              private _fb: FormBuilder) {
    this.department = new Department();
  }

  ngOnInit(): void {
    this.fillTheForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['departments']) {
      this.departments = changes['departments'].currentValue;
      this.fillTheForm();
    }
  }

  emitChosenDepartment(departmentId?: number){
    this.departmentChoose.emit(departmentId);
  }

  private fillTheForm() {
    if (this.department.name==null) {
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
    name: [name, [Validators.required]]});
  }

  submitDepartmentForm(department: any) {
    let value = department.value;
    this.department.name = value.name;
    this.departmentService.save(value).subscribe(responseDepartment => {
      let closeNewDepartmentFormButton = document.getElementById("closeNewDepartmentFormButton");
      if (closeNewDepartmentFormButton) {
        closeNewDepartmentFormButton.click();
      }
      let closeEditDepartmentFormButton = document.getElementById("closeEditDepartmentFormButton");
      if (closeEditDepartmentFormButton) {
        closeEditDepartmentFormButton.click();
      }
      let isNew = value.id == null;
      this.persistedDepartment.emit({
        isNew: isNew,
        dep: responseDepartment
      });
    }, error => this.errorDepartment = error);

  }
}
