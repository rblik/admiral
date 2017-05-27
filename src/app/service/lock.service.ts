import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {Url} from "../url";
import {Observable} from "rxjs/Observable";
import {DateLock} from "../model/date-lock";
import {WorkInfo} from "../model/work-info";

@Injectable()
export class LockService {
  private locksUrl: string;

  constructor(private http: Http, private authService: AuthService) {
    this.locksUrl = Url.getUrl("/locks")
  }

  public getLocksForPeriod(from: string, to: string): Observable<DateLock[]> {
    let params = new URLSearchParams();
    params.append("from", from);
    params.append("to", to);
    let headers = new Headers();
    headers.append("Authorization", this.authService.getToken());
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