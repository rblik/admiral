import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Employee} from "../model/employee";
import {Headers, Http, RequestOptions} from "@angular/http";
import {SessionStorageService} from "ng2-webstorage";

@Injectable()
export class AuthService {
  private loggedEmployee: Subject<Employee> = new BehaviorSubject<Employee>(null);
  private static TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJuYW1lMUBnbWFpbC5jb20iLCJjcmVhdGVkIjoxNDkxMzUxNTIzNzM0fQ.LGVyUGLNkarbcC8_x7bWIqmVBq8YFkjxyZUDMKlat2Fqewg2s-uybORXY8aibdbIYzLLzDlDbAB8rBW3Y2mD5Q";

  constructor(private http: Http, private localSt: SessionStorageService) {
    this.getProfile();
  }

  public getProfile(): void {
    this.http.get("http://localhost:8080/profile", this.getOptions()).map(res => res.json())
      .subscribe(employee => {
        // this.loggedEmployee.next(employee);
        this.localSt.store("employee", JSON.stringify(employee));
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
