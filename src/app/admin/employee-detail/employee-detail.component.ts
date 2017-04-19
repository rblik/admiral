import {Component, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {ActivatedRoute, Params} from "@angular/router";
import {EmployeeService} from "../service/employee.service";
import {ProjectService} from "../service/project.service";
import {Project} from "../../model/project";
import {Observable} from "rxjs/Observable";
@Component({
  selector: 'employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit{
  private employee: Employee;
  private projects: Project[];
  constructor(private employeeService: EmployeeService, private projectService: ProjectService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.map((params: Params) => params['employeeId']).switchMap((employeeId: number) => {
      return Observable.forkJoin([this.employeeService.getEmployee(employeeId), this.projectService.getProjectsByEmployee(employeeId)]);
    }).catch(e => Observable.throw(e.json().details[0]))
      .subscribe(([employee, projects]) => {
        this.employee = employee;
        this.projects = projects;
      });
  }

  appendProject(project){
    if (project != null) {
    this.projects.push(project);
    }
  }

}
