import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {WorkInfo} from "../model/work-info";
import {WorkUnit} from "../model/work-unit";
import {AgreementDto} from "../model/agreement-dto";
import {AuthService} from "./auth.service";
import {Url} from "../url";

@Injectable()
export class WorkInfoService {
  private unitsUrl: string;
  private agreementsUrl: string;
  private adminUnitsUrl: string;
  constructor(private http: Http, private authService: AuthService) {
    this.agreementsUrl = Url.getUrl("/agreements");
    this.unitsUrl = Url.getUrl("/units");
  }

  public getWeekWork(sundayDate: string, nextSundayDate: string, employeeId?: number, adminUnitsUrl?: string): Observable<WorkInfo[]> {
    let params = new URLSearchParams();
    params.append("from", sundayDate);
    params.append("to", nextSundayDate);
    if (!!employeeId) params.append("employeeId", employeeId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(!!adminUnitsUrl ? adminUnitsUrl : this.unitsUrl, options)
      .map(res => res.json());
  }

  public getDayWork(date: string, agreementId: number, employeeId?: number, adminUnitsUrl?: string): Observable<WorkInfo[]>{
    let params = new URLSearchParams();
    if (agreementId !== -1) params.append("agreementId", agreementId.toString());
    if (!!employeeId) params.append("employeeId", employeeId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get((!!adminUnitsUrl ? adminUnitsUrl : this.unitsUrl) + "/" + date, options)
      .map(res => res.json());
  }

  public getWorkAgreements(): Observable<AgreementDto[]>{
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers});
    return this.http.get(this.agreementsUrl, options).map(res => res.json());
  }

  public save(agreementId: number, workUnit: WorkUnit, employeeId?: number, adminUnitsUrl?: string): Observable<WorkUnit> {
    let params = new URLSearchParams();
    params.append("agreementId", agreementId.toString());
    if (!!employeeId) params.append("employeeId", employeeId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(!!adminUnitsUrl ? adminUnitsUrl : this.unitsUrl, JSON.stringify(workUnit), options)
      .map(res => res.json())
      .catch(e => {
        let s: string = e.json().cause=='TimeOverlappingException'? 'רקורד על פרק הזמן הזה כבר קיימת.' : e.json().details[0];
        return Observable.throw(s);
      });
  }

  public remove(unitId: number, employeeId?: number, adminUnitsUrl?: string): void {
    let params = new URLSearchParams();
    if (!!employeeId) params.append("employeeId", employeeId.toString());
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.authService.getToken());
    let options = new RequestOptions({headers: headers, search: params});
    this.http.delete((!!adminUnitsUrl ? adminUnitsUrl : this.unitsUrl) + "/" + unitId, options).subscribe(() => {});
  }

}
