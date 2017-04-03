import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Employee} from "../model/employee";
import {Http, Headers, RequestOptions} from "@angular/http";

@Injectable()
export class AuthService {
  private loggedEmployee: Subject<Employee> = new BehaviorSubject<Employee>(null);

  constructor(private http: Http) {
    this.getProfile();
  }

  public getProfile(){
    this.http.get("http://localhost:8080/profile", this.getOptions()).map(res => res.json())
      .catch(e => {
        if (e.status === 401) {
          return Observable.throw('Wrong Credentials');
        }
      }).subscribe(employee => this.loggedEmployee.next(employee));
  }

  public getOptions(): RequestOptions {
    let headers = new Headers({'Content-Type': 'application/json'});
    headers.append("Authorization", "Basic " + btoa("name5@gmail.com" + ":" + "Qwerty123"));
    return new RequestOptions({headers: headers});
  }

  public getLoggedWorker(): Subject<Employee> {
    return this.loggedEmployee;
  }
}
