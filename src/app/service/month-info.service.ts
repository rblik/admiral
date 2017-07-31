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
  private monthInfoAUrl: string;

  constructor(private http: Http, private authService: AuthService) {
    this.locksUrl = Url.getUrl("/locks");
    this.hoursUrl = Url.getUrl("/hours");
    this.monthInfoUrl = Url.getUrl("/monthinfo");
    this.monthInfoAUrl = Url.getUrl("/admin/dashboard/monthinfo");
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

  public updateSumHoursForMonth(dateStr: string, hoursSum: number): Observable<MonthInfo> {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let date = new Date(dateStr);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('month', month.toString());
    params.append('hoursSum', hoursSum.toString());
    let options = new RequestOptions({headers: headers, search: params});

    return this.http.put(this.monthInfoAUrl, "{}", options)
      .map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public getSumHoursForMonths(year?: number): Observable<any[]> {
    let params = new URLSearchParams();
    if (!!year) params.append("year", year.toString());
    let headers = new Headers();
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    console.log(year);
    return this.http.get(this.monthInfoAUrl, options)
      .map(res => {
        console.log(year);
        return res.json();
      });
  }
}
