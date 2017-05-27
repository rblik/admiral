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

  constructor(private auth: AuthService, private http: Http, private timeService: TimeService) {
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
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    return locks.filter(lock => lock.month === month && lock.year === year).length != 0;
  }
}
