import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class AuthGuardTokenOnlyService implements CanActivate{
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkLogin(state.url);
  }

  checkLogin(url: string): boolean {
    let token = this.authService.getToken();
    if (token) {
      return true;
    }
    this.authService.redirectUrl = url;
    this.router.navigateByUrl('/app');
    return false;
  }
}
