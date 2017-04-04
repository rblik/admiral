import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";
import {Agreement} from "../model/agreement";
import {AuthService} from "./auth.service";

@Injectable()
export class WorkInfoService {

  constructor(private http: Http, private authService: AuthService) {
  }

  public getWeekWork(sundayDate: string, nextSundayDate: string): Observable<WorkInfo[]> {
    let params = new URLSearchParams();
    params.append("from", sundayDate);
    params.append("to", nextSundayDate);
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get("http://localhost:8080/units", options)
      .map(res => res.json());
  }

  public getDayWork(date: string, agreementId: number): Observable<WorkInfo[]>{
    let params = new URLSearchParams();
    params.append("agreementId", agreementId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get("http://localhost:8080/units/" + date, options)
      .map(res => res.json());
  }

  public getWorkAgreements(): Observable<Agreement[]>{
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers});
    return this.http.get("http://localhost:8080/agreements", options).map(res => res.json());
  }

  public save(agreementId: number, workUnit: WorkUnit): Observable<WorkUnit> {
    let params = new URLSearchParams();
    params.append("agreementId", agreementId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post("http://localhost:8080/units", JSON.stringify(workUnit), options)
      .map(res => res.json())
      .catch(e => {
        let s: string = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public remove(unitId: number): void {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers});
    this.http.delete("http://localhost:8080/units/" + unitId, options).subscribe(() => {});
  }

}
