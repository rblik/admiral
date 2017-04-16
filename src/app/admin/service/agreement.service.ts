import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptions, URLSearchParams} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {Agreement} from "../../model/agreement";
import {Observable} from "rxjs";
import {Url} from "../../url";

@Injectable()
export class AgreementService {
  private agreementsUrl: string;

  constructor(private auth: AuthService, private http: Http) {
    this.agreementsUrl = Url.getUrl("/admin/agreements");
  }

  public getAgreements(): Observable<Agreement[]> {
    return this.http.get(this.agreementsUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public save(employeeId: number, projectId: number): Observable<Agreement> {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let params = new URLSearchParams();
    params.append('employeeId', employeeId.toString());
    params.append('projectId', projectId.toString());
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.agreementsUrl, JSON.stringify({'active': true}), options)
      .map(res => res.json())
      .catch(e => Observable.throw(e.json().details[0]));
  }
}
