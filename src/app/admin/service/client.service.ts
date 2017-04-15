import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
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
    return this.http.get(this.clientUrl + "/" + clientId, {
      headers: new Headers({'Authorization': this.auth.getToken()})
    }).map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public save(client: Client): Observable<Client> {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let options = new RequestOptions({headers: headers});
    return this.http.post(this.clientUrl, JSON.stringify(client), options)
      .map(res => res.json())
      .catch(e => {
        if (e.status == 409) {
          return Observable.throw('שם הלקוח כזה כבר קיים');
        }
      });
  }
}
