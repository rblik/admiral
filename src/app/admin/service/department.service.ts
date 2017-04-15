import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptions} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {Url} from "../../url";
import {Observable} from "rxjs/Observable";
import {Department} from "../../model/department";

@Injectable()
export class DepartmentService {
  private departmentsUrl: string;

  constructor(private auth: AuthService, private http: Http) {
    this.departmentsUrl = Url.getUrl('/admin/departments');
  }

  public getAll(): Observable<Department[]> {
    return this.http.get(this.departmentsUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public save(department: Department): Observable<Department> {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let options = new RequestOptions({headers: headers});
    return this.http.post(this.departmentsUrl, JSON.stringify(department), options)
      .map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }
}
