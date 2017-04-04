import {Injectable} from "@angular/core";
import {Http, Headers, ResponseContentType, RequestMethod, URLSearchParams} from "@angular/http";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";

@Injectable()
export class DownloadService {

  constructor(private http: Http, private auth: AuthService) {
  }

  public downloadMissing(type: string, from: string, to: string) {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);

    return this.http.get("http://localhost:8080/admin/" + type + "/missing", {
      method: RequestMethod.Get,
      responseType: ResponseContentType.Blob,
      headers: new Headers({'Authorization': this.auth.getToken()}),
      search: params
    }).map(res => res).catch(e => {
      let s: string = e.json().details[0];
      return Observable.throw(s);
    }).map(res => res).catch(e => {
      if (e.status === 400) {
        return Observable.throw('No information about that period of time');
      }
    });
  }

  public downloadPartial(type: string, from: string, to: string) {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('limit', '7');
    return this.http.get("http://localhost:8080/admin/" + type + "/partial", {
      method: RequestMethod.Get,
      responseType: ResponseContentType.Blob,
      headers: new Headers({'Authorization': this.auth.getToken()}),
      search: params
    }).map(res => res).catch(e => {
      if (e.status === 400) {
        return Observable.throw('No information about that period of time');
      }
    });
  }

  public downloadPivotal(type: string, from: string, to: string) {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    return this.http.get("http://localhost:8080/admin/" + type + "/pivotal", {
      method: RequestMethod.Get,
      responseType: ResponseContentType.Blob,
      headers: new Headers({'Authorization': this.auth.getToken()}),
      search: params
    }).map(res => res).catch(e => {
      if (e.status === 400) {
        return Observable.throw('No information about that period of time');
      }
    });
  }


}
