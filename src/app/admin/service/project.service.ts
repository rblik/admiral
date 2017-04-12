import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
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
}
