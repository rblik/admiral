import {Injectable} from "@angular/core";
import {Http, Headers, URLSearchParams, RequestOptions} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {Url} from "../../url";
import {Observable} from "rxjs";
import {Project} from "../../model/project";

@Injectable()
export class ProjectService {
  private projectsUrl: string;

  constructor(private auth: AuthService, private http: Http) {
    this.projectsUrl = Url.getUrl('/admin/projects');
  }

  public getProjects(): Observable<Project[]> {
    return this.http.get(this.projectsUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public getProjectsByEmployee(employeeId: number): Observable<Project[]> {
    let params = new URLSearchParams();
    params.append('employeeId', employeeId.toString());
    return this.http.get(this.projectsUrl, {
      search: params,
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  save(clientId: number, project: Project): Observable<Project> {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let params = new URLSearchParams();
    params.append('clientId', clientId.toString());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.projectsUrl, JSON.stringify(project), options)
      .map(res => res.json())
      .catch(e => Observable.throw(e.json().details[0]));
  }
}
