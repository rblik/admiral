import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptions, URLSearchParams} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {AgreementDto} from "../../model/agreement-dto";
import {Observable} from "rxjs";
import {Url} from "../../url";
import {TimeService} from "../../service/time.service";
import {Agreement} from "../../model/agreement";
import {Employee} from "../../model/employee";

@Injectable()
export class AgreementService {
  private agreementsUrl: string;

  constructor(private auth: AuthService, private http: Http, private timeService: TimeService) {
    this.agreementsUrl = Url.getUrl("/admin/agreements");
  }

  public getAgreements(): Observable<AgreementDto[]> {
    return this.http.get(this.agreementsUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public getAgreementsByEmployee(emplId: number): Observable<AgreementDto[]>{
    let params = new URLSearchParams();
    params.append("employeeId", emplId.toString());
    return this.http.get(this.agreementsUrl, {
      search: params,
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public save(employeeId: number, projectId: number, agreement: any): Observable<Agreement> {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let params = new URLSearchParams();
    params.append('employeeId', employeeId.toString());
    params.append('projectId', projectId.toString());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.agreementsUrl, JSON.stringify(agreement), options)
      .map(res => res.json())
      .catch(e => Observable.throw(e.json().details[0]));
  }

  public remove(agreementId: number): Observable<any> {
    return this.http.delete(this.agreementsUrl + "/" + agreementId, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res)
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public enable(agreementId: number): Observable<any> {
    return this.http.put(this.agreementsUrl + "/" + agreementId, null,{
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res)
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

}
