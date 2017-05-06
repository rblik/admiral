import {Injectable} from "@angular/core";
import {AuthService} from "../../service/auth.service";
import {Observable} from "rxjs";
import {Employee} from "../../model/employee";
import {Http, URLSearchParams, Headers, RequestOptions} from "@angular/http";
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

  public changePass(employeeId: number, newPass: string): Observable<any> {
    let params = new URLSearchParams();
    params.append('password', newPass);
    let headers = new Headers({'Authorization': this.auth.getToken()});
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put(this.employeesUrl+ '/' + employeeId, params.toString(), {
      headers: headers,
    }).catch(e => {
      let s = e.json().details[0];
      return Observable.throw(s);
    })
  }

  public save(departmentId: number, employee: Employee): Observable<Employee> {
    let params = new URLSearchParams();
    params.append('departmentId', departmentId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.employeesUrl, JSON.stringify(employee), options)
      .map(res => res.json())
      .catch(e => {
        let error = e.json();
        if (e.status == 409) {
          let s = error.details[0].split(' ');
          if ('email'==s[0]) {
            s = 'עובד עם ד"א ' + s[1] + ' כבר קיים';
          }
          return Observable.throw(s);
        } else if (error.cause == 'ValidationException'){
          return Observable.throw('ד"א לא תקין');
        }else {
          return Observable.throw(error.details[0]);
        }
      });
  }
}
