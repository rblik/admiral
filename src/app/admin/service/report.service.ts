import {Injectable} from "@angular/core";
import {AuthService} from "../../service/auth.service";
import {Http, URLSearchParams, Headers} from "@angular/http";
import {Url} from "../../url";
import {Observable} from "rxjs";
import {WorkInfo} from "../../model/work-info";
@Injectable()
export class ReportService {

  private partialUrl: string;
  private missingUrl: string;
  private pivotalUrl: string;

  constructor(private auth: AuthService, private http: Http) {
    this.partialUrl = Url.getUrl("/admin/info/partial");
    this.missingUrl = Url.getUrl("/admin/info/missing");
    this.pivotalUrl = Url.getUrl("/admin/info/pivotal");
  }

  getDistinct(objects: Array<any>, field: string): Array<any> {
    let arr = [];
    for (let i = 0; i < objects.length; i++) {
      if (arr.indexOf(objects[i][field] == -1)) {
        arr.push(objects[i][field]);
      }
    }
    return arr;
  }

  public getPartialDaysForPeriodAndLimit(from: string, to: string, limit: number, employeeId?: string, departmentId?: string): Observable<WorkInfo[]> {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('limit', limit.toString());
    params.append('employeeId', employeeId);
    params.append('departmentId', departmentId);
    return this.http.get(this.partialUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()}),
      search: params
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
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

  public getPivotalForPeriod(from: string, to: string, employeeId?: string, departmentId?: string, projectId?: string, clientId?: string) {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('employeeId', employeeId);
    params.append('departmentId', departmentId);
    params.append('projectId', projectId);
    params.append('clientId', clientId);
    return this.http.get(this.pivotalUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()}),
      search: params
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }
}
