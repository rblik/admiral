import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";
import {Agreement} from "../model/agreement";
import {AuthService} from "./auth.service";
import {Url} from "../url";

@Injectable()
export class WorkInfoService {
  private unitsUrl: string;
  private agreementsUrl: string;
  constructor(private http: Http, private authService: AuthService) {
    this.agreementsUrl = Url.getUrl("/agreements");
    this.unitsUrl = Url.getUrl("/units");
  }

  public getWeekWork(sundayDate: string, nextSundayDate: string): Observable<WorkInfo[]> {
    let params = new URLSearchParams();
    params.append("from", sundayDate);
    params.append("to", nextSundayDate);
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.unitsUrl, options)
      .map(res => res.json());
  }

  public getDayWork(date: string, agreementId?: number): Observable<WorkInfo[]>{
    let params = new URLSearchParams();
    if (!!agreementId) {
      params.append("agreementId", agreementId.toString());
    }
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.unitsUrl + "/" + date, options)
      .map(res => res.json());
  }

  public getWorkAgreements(): Observable<Agreement[]>{
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers});
    return this.http.get(this.agreementsUrl, options).map(res => res.json());
  }

  public save(agreementId: number, workUnit: WorkUnit): Observable<WorkUnit> {
    let params = new URLSearchParams();
    params.append("agreementId", agreementId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.unitsUrl, JSON.stringify(workUnit), options)
      .map(res => res.json())
      .catch(e => {
        let s: string = e.json().cause=='TimeOverlappingException'? 'רקורד על פרק הזמן הזה כבר קיימת.' : e.json().details[0];
        return Observable.throw(s);
      });
  }

  public remove(unitId: number): void {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers});
    this.http.delete(this.unitsUrl + "/" + unitId, options).subscribe(() => {});
  }

}
