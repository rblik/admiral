import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {Url} from "../url";
import {Observable} from "rxjs/Observable";
import {MonthInfo} from "../model/month-info";

@Injectable()
export class MonthInfoService {
  private locksUrl: string;
  private hoursUrl: string;
  private monthInfoUrl: string;

  constructor(private http: Http, private authService: AuthService) {
    this.locksUrl = Url.getUrl("/locks");
    this.hoursUrl = Url.getUrl("/hours");
    this.monthInfoUrl = Url.getUrl("/monthinfo");
  }

  public isLockedForMonth(year: number, month: number): Observable<boolean> {
    let params = new URLSearchParams();
    params.append("year", year.toString());
    params.append("month", (month + 1).toString());
    let headers = new Headers();
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.locksUrl, options)
      .map(res => res.json());
  }

  public getMonthInfo(year: number, month: number): Observable<MonthInfo> {
    let params = new URLSearchParams();
    params.append("year", year.toString());
    params.append("month", (month + 1).toString());
    let headers = new Headers();
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.monthInfoUrl, options)
      .map(res => res.json());
  }
}
