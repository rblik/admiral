import {Injectable} from "@angular/core";
import {Url} from "../../url";
import {TimeService} from "../../service/time.service";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {DateLock} from "../../model/date-lock";
import {Observable} from "rxjs/Observable";
import {WorkInfo} from "../../model/work-info";

@Injectable()
export class AdminLockService {

  private locksUrl: string;

  constructor(private http: Http, private auth: AuthService) {
    this.locksUrl = Url.getUrl("/admin/dashboard/locks");
  }

  public getLocksForPeriodAndEmployee(from: string, to: string, employeeId: number): Observable<DateLock[]> {
    let params = new URLSearchParams();
    params.append("from", from);
    params.append("to", to);
    params.append("employeeId", employeeId.toString());
    let headers = new Headers();
    headers.append("Authorization", this.auth.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.locksUrl, options)
      .map(res => res.json());
  }

  public isLocked(locks: DateLock[], info: WorkInfo): boolean {
    let date = new Date(info.date);
    return this.isLockedDate(locks, date);
  }

  public isLockedDate(locks: DateLock[], date: Date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    return locks.filter(lock => lock.month === month && lock.year === year).length != 0;
  }

  public saveLock(dateStr: string, employeeId: number): Observable<DateLock>{
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let params = new URLSearchParams();
    params.append('employeeId', employeeId.toString());
    let options = new RequestOptions({headers: headers, search: params});
    let date = new Date(dateStr);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    return this.http.post(this.locksUrl, JSON.stringify({'year': year, 'month': month}), options)
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
    return this.http.delete(this.locksUrl, options);
  }
}
