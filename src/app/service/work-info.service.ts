import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";

@Injectable()
export class WorkInfoService {

  constructor(private http: Http) {
  }

  public getWeekWork(sundayDate: string, nextSundayDate: string): Observable<WorkInfo[]> {
    return this.http.get("http://localhost:8080/units?from=" + sundayDate + "&to=" + nextSundayDate)
      .map(res => res.json());
  }

  public getDayWork(date: string, agreementId: number){
    return this.http.get("http://localhost:8080/units" + date + "?agreementId=" + agreementId)
      .map(res => res.json());
  }

  public getWorkAgreements(){
    return this.http.get("http://localhost:8080/agreements").map(res => res.json());
  }

  public save(agreementId: number, workUnit: WorkUnit): Observable<WorkUnit> {
    return this.http.post("http://localhost:8080/units?agreementId=" + agreementId, JSON.stringify(workUnit))
      .map(res => res.json())
      .catch(e => {
        return Observable.throw(e);
      });
  }

  public remove(unitId: number) {
    this.http.delete("http://localhost:8080/" + unitId).subscribe(() => {});
  }

}
