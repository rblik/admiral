import {Injectable} from "@angular/core";
import {Url} from "../../url";
import {AuthService} from "../../service/auth.service";
import {Http, Headers} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class MailService {
  private adminUrl: string;

  constructor(private http: Http, private auth: AuthService) {
    this.adminUrl = Url.getUrl("/admin/mail");
  }

  public sendMissingByEmail(from: string, to: string, employeeIds: number[], email: string, message: string): Observable<string> {
    let body = {'from': from, 'to': to, 'employeeIds': employeeIds, 'email': email, 'message': message};
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    return this.http.post(this.adminUrl + '/missing', JSON.stringify(body), {headers: headers})
      .map(res => res)
      .catch(e => {
        return Observable.throw(e);
      });
  }
}
