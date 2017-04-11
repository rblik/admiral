import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
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
        return Observable.throw(s)
      });
  }
}
