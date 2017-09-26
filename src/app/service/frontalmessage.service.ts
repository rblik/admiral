import {Observable} from "rxjs/Observable";
import {FrontalMessage} from "../model/frontalmessage";
import { Http} from "@angular/http";
import {Url} from "../url";
import {Injectable} from "@angular/core";

@Injectable()
export class FrontalMessageService{
  private frontalMessagesUrl: string;

  constructor(private http: Http) {
    this.frontalMessagesUrl=Url.getUrl("/auth/frontalmessages");
  }

  public getAllFrontalMessages():Observable<FrontalMessage[]> {
    return this.http.get(this.frontalMessagesUrl)
      .map(res => res.json());
  }
}
