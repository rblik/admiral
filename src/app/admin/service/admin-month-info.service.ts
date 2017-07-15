import {Injectable} from "@angular/core";
import {Url} from "../../url";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {Observable} from "rxjs/Observable";
import {MonthInfo} from "../../model/month-info";

@Injectable()
export class AdminMonthInfoService {

  private monthInfoUrl: string;

  constructor(private http: Http, private auth: AuthService) {
    this.monthInfoUrl = Url.getUrl("/admin/dashboard/monthinfo");
  }

  public ckeckIsLockedForMonthAndEmployee(year: number, month: number, employeeId: number): Observable<MonthInfo> {
    let params = new URLSearchParams();
    params.append("year", year.toString());
    params.append("month", (month + 1).toString());
    params.append("employeeId", employeeId.toString());
    let headers = new Headers();
    headers.append("Authorization", this.auth.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.monthInfoUrl, options)
      .map(res => res.json());
  }

  public saveMonthInfo(dateStr: string, locked: boolean, hoursSum: number, employeeId: number): Observable<MonthInfo>{
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let params = new URLSearchParams();
    params.append('employeeId', employeeId.toString());
    let options = new RequestOptions({headers: headers, search: params});
    let date = new Date(dateStr);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    return this.http.post(this.monthInfoUrl, JSON.stringify(new MonthInfo(year, month, locked, hoursSum)), options)
      .map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public removeLock(dateStr: string, employeeId: number): Observable<any>{
    let headers = new Headers();
    headers.append("Authorization", this.auth.getToken());
    let date = new Date(dateStr);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let params = new URLSearchParams();
    params.append('employeeId', employeeId.toString());
    params.append('year', year.toString());
    params.append('month', month.toString());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.delete(this.monthInfoUrl, options)
      .map(res => res)
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public updateSumHoursForMonth(dateStr: string, employeeIds: number[], hoursSum: number) {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let date = new Date(dateStr);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let params = new URLSearchParams();
    let options = new RequestOptions({headers: headers, search: params});

    let monthInfo = new MonthInfo(year, month, false, hoursSum);
    let dto = {'monthInfo':monthInfo, 'employeeIds':employeeIds};

    return this.http.put(this.monthInfoUrl, JSON.stringify(dto), options)
      .map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }
}
