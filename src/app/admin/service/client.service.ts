import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {Url} from "../../url";
import {Observable} from "rxjs";
import {Client} from "../../model/client";

@Injectable()
export class ClientService {
  private clientUrl: string;

  constructor(private auth: AuthService, private http: Http) {
    this.clientUrl = Url.getUrl('/admin/clients');
  }

  public getClients(): Observable<Client[]> {
    return this.http.get(this.clientUrl, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public get(clientId: number): Observable<Client> {
    return this.http.get(this.clientUrl + "/" + clientId, {headers: new Headers({'Authorization': this.auth.getToken()})
  }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }
}
