import {Injectable} from "@angular/core";
import {AuthService} from "../../service/auth.service";
import {Observable} from "rxjs";
import {Employee} from "../../model/employee";
import {Http, URLSearchParams, Headers} from "@angular/http";
import {Url} from "../../url";

@Injectable()
export class EmployeeService {

  private employeesUrl: string;

  constructor(private auth: AuthService, private http: Http) {
    this.employeesUrl = Url.getUrl("/admin/employees");
  }

  public getAllEmployees(): Observable<Employee[]> {
    return this.http.get(this.employeesUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s)
      });
  }

  public getEmployee(employeeId: number): Observable<Employee> {
    return this.http.get(this.employeesUrl + '/' + employeeId, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s)
      });
  }
}
