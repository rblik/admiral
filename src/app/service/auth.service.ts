import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Employee} from "../model/employee";
import {Headers, Http, RequestOptions} from "@angular/http";
import {SessionStorageService} from "ng2-webstorage";
import {Credentials} from "../model/credentials";

@Injectable()
export class AuthService {

  constructor(private http: Http, private localSt: SessionStorageService) {
    this.storeProfile();
  }

  public login(credentials: Credentials): Observable<any> {
    return this.http.post("http://localhost:8080/auth", JSON.stringify(credentials), new RequestOptions({headers: new Headers({'Content-Type': 'application/json'})}))
      .map(res => res.json())
      .catch(e => {
        if (e.status === 401) {
          return Observable.throw('Wrong credentials');
        }
      });
  }

  public storeProfile(): void {
    this.http.get("http://localhost:8080/profile", this.getOptions()).map(res => res.json()).catch(e => Observable.throw('Unauthorized'))
      .subscribe(employee => {
        // this.loggedEmployee.next(employee);
        this.localSt.store("employee", JSON.stringify(employee));
      });
  }

  public getOptions(): RequestOptions {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", this.getToken());
    return new RequestOptions({headers: headers});
  }

  public getToken(): string {
    return this.localSt.retrieve("TOKEN");
  }

  public tokenObserv(): Observable<string> {
    return this.localSt.observe('TOKEN');
  }

  public getProfile(): Employee {
    return JSON.parse(this.localSt.retrieve("employee"));
  }

  public profileObserv(): Observable<string> {
    return this.localSt.observe("employee");
  }

  public logout() {
    this.localSt.clear('TOKEN');
    this.localSt.clear('employee');
  }
}
