import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Employee} from "../model/employee";
import {Http} from "@angular/http";

@Injectable()
export class AuthService {
  private loggedEmployee: Subject<Employee> = new BehaviorSubject<Employee>(null);

  constructor(private http: Http) {
    this.getProfile();
  }

  public getProfile(){
    this.http.get("http://localhost:8080/profile").map(res => res.json())
      .catch(e => {
        if (e.status === 401) {
          return Observable.throw('Wrong Credentials');
        }
      }).subscribe(employee => this.loggedEmployee.next(employee));
  }

  public getLoggedWorker(): Subject<Employee> {
    return this.loggedEmployee;
  }
}
