import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Employee} from "../model/employee";
import {Headers, Http, RequestOptions} from "@angular/http";
import {SessionStorageService} from "ng2-webstorage";

@Injectable()
export class AuthService {
  private loggedEmployee: Subject<Employee> = new BehaviorSubject<Employee>(null);
  private static TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJuYW1lNUBnbWFpbC5jb20iLCJjcmVhdGVkIjoxNDkxMzM1OTE1ODMzfQ.rTdQQdMG3A1gzmWPGRKlS1VwO0ITESYbYZ-cjgQh4egaDCXRcRxPl4BQYnQaZOPyeHNEzcqy89Ko35C-nndOcQ";

  constructor(private http: Http, private localSt: SessionStorageService) {
    this.getProfile();
  }

  public getProfile(): void {
    this.http.get("http://localhost:8080/profile", this.getOptions()).map(res => res.json())
      .catch(e => {
        if (e.status === 401) {
          return Observable.throw('Wrong Credentials');
        }
      }).subscribe(employee => {
      this.loggedEmployee.next(employee);
      this.localSt.store("TOKEN", AuthService.TOKEN);
    });
  }

  public getOptions(): RequestOptions {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", AuthService.TOKEN);
    return new RequestOptions({headers: headers});
  }

  public getLoggedWorker(): Subject<Employee> {
    return this.loggedEmployee;
  }

  public getToken(): string {
    return this.localSt.retrieve("TOKEN");
  }
}
