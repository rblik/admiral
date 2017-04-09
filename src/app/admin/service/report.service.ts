import {Injectable} from "@angular/core";
import {AuthService} from "../../service/auth.service";
import {Http, URLSearchParams, Headers} from "@angular/http";
import {Url} from "../../url";
import {Observable} from "rxjs";
import {WorkInfo} from "../../model/work-info";
@Injectable()
export class ReportService {

  private missingUrl: string;

  constructor(private auth: AuthService, private http: Http) {
    this.missingUrl = Url.getUrl("/admin/info/missing");
  }

  public getMissedDaysForPeriod(from: string, to: string, employeeId?: string, departmentId?: string): Observable<WorkInfo[]> {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('employeeId', employeeId);
    params.append('departmentId', departmentId);
    return this.http.get(this.missingUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()}),
      search: params
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }
}
