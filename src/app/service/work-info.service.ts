import {Injectable} from "@angular/core";
import {Http, RequestOptions, URLSearchParams, Headers} from "@angular/http";
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
    return this.http.get("http://localhost:8080/units?from=" + sundayDate + "&to=" + nextSundayDate)
      .map(res => res.json());
  }

  public getDayWork(date: string, agreementId: number): Observable<WorkInfo[]>{
    return this.http.get("http://localhost:8080/units/" + date + "?agreementId=" + agreementId)
      .map(res => res.json());
  }

  public getWorkAgreements(): Observable<Agreement[]>{
    return this.http.get("http://localhost:8080/agreements").map(res => res.json());
  }

  public save(agreementId: number, workUnit: WorkUnit): Observable<WorkUnit> {
    let params = new URLSearchParams();
    params.append("agreementId", agreementId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post("http://localhost:8080/units", JSON.stringify(workUnit), options)
      .map(res => res.json())
      .catch(e => {
        return Observable.throw(e);
      });
  }

  public remove(unitId: number): void {
    this.http.delete("http://localhost:8080/" + unitId).subscribe(() => {});
  }

}
