
import {Injectable} from "@angular/core";
import {Url} from "../../url";
import {Headers, Http, RequestOptions, URLSearchParams} from "@angular/http";
import {AuthService} from "../../service/auth.service";
import {Observable} from "rxjs/Observable";
import {FrontalMessage} from "../../model/frontalmessage";

@Injectable()
export class AdminFrontalMessagesService{
  private frontalMessagesUrl: string;

  constructor(private http: Http, private auth:AuthService) {
    this.frontalMessagesUrl=Url.getUrl("/admin/frontalmessages");
    console.log(this.frontalMessagesUrl)
  }

  public getAllFrontalMessages():Observable<FrontalMessage[]> {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let options = new RequestOptions({headers: headers});
    return this.http.get(this.frontalMessagesUrl,options)
      .map(res => res.json());
  }

  public saveFrontalMessage(frontalMessage:FrontalMessage):Observable<FrontalMessage>{
    console.log("save")
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.auth.getToken());
    let options = new RequestOptions({headers: headers});
    return this.http.post(this.frontalMessagesUrl, JSON.stringify(frontalMessage), options)
      .map(res => res.json())
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }

  public remove(frontalMessageId: number): Observable<any> {
    console.log("removing")
    console.log(this.auth.getToken())
    let headers = new Headers();
    headers.append("Authorization", this.auth.getToken());
    return this.http.delete(this.frontalMessagesUrl + "/" + frontalMessageId, {
      headers: headers
    }).map(res => res)
      .catch(e => {
        let s = e.json().details[0];
        return Observable.throw(s);
      });
  }
}
