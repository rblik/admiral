import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Http, RequestMethod, ResponseContentType, URLSearchParams, Headers} from "@angular/http";
import {AuthService} from "./auth.service";
import {Url} from "../url";

@Injectable()
export class UserDownloadService {
  constructor(private http: Http, private auth: AuthService) {
  }

  public downloadPivotal(type: string, from: string, to: string) {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    return this.http.get(Url.getUrl("/") + type + "/download", {
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

  public getMimeType(type: string): string {
    let apType;
    if (type === 'pdf') {
      apType = 'pdf';
    } else if (type === 'xls') {
      apType = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    return 'application/' + apType;
  }
}
