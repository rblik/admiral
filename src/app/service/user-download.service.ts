import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Http, RequestMethod, ResponseContentType, URLSearchParams, Headers, RequestOptions} from "@angular/http";
import {AuthService} from "./auth.service";
import {Url} from "../url";

@Injectable()
export class UserDownloadService {
  constructor(private http: Http, private auth: AuthService) {
  }

  public downloadPivotal(type: string, from: string, to: string, template?: boolean) {
    let params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    return this.http.get(Url.getUrl("/") + type + "/download" + (template ? "Template" : ""), {
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

  public uploadReports(year: number, month: number, file: File) {
    let headers = new Headers();
    headers.append("Authorization", this.auth.getToken());
    let form = new FormData();
    form.append('year', year.toString());
    form.append('month', (month + 1).toString());
    form.append('file', file);
    let options = new RequestOptions({headers: headers});
    return this.http.post(Url.getUrl("/xlsx/upload"), form, options)
      .map(res => res)
      .catch(e => {
        let json = e.json();
        if (json.cause=='IllegalCellFormatException') {
          let errorString = json.details[0];
          let errArr = errorString.split(";");
          let s1 = errArr[0] === "" ? "" : "היו שגעיות בתאים: " + errArr[0];
          let s2 = errArr[1] === "" ? "" : " בשורות: " + errArr[1] + " קיימים תאים ריקים";
          return Observable.throw(s1 + s2);
        } else if (json.cause=='TimeOverlappingException') {
          return Observable.throw("אירעה שגיאה בטעינת הקובץ, הזנת שעות חופפות על אותה המשימה.")
        } else if (json.cause=='DateLockedException') {
          return Observable.throw("החודש הזה סגור לשינויים.")
        } else if (json.cause=='TimeRangeException') {
          return Observable.throw("אירעה שגיאה בטעינת הקובץ. אנא בדוק את השעות שהזנת.")
        } else if (json.cause=='NotFoundException') {
          return Observable.throw("אירעה שגיאה בטעינת הקובץ. אנא בדוק את אנא בדוק את מזהי פרויקטים שהזנת.")
        } else {
          return Observable.throw("אירעה שגיאה בטעינת הקובץ, אנא בדוק את המיהמנות הנתונים שהזנת.");
        }
      });
  }

  public xlsType(): string {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
}
