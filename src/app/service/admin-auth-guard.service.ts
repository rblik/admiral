import {Injectable} from "@angular/core";
import {
  ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router,
  RouterStateSnapshot
} from "@angular/router";
import {AuthService} from "./auth.service";
import {Employee} from "../model/employee";
import {Observable} from "rxjs";

@Injectable()
export class AdminAuthGuardService implements CanActivate, CanActivateChild, CanLoad{
  canLoad(route: Route): Observable<boolean>|Promise<boolean>|boolean {
    let url = `/${route.path}`;
    return this.checkLogin(url);
  }

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin(state.url);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute, state);
  }

  checkLogin(url: string): boolean {
    let profile: Employee = this.authService.getProfile();
    if(profile!=null){
      return this.checkAdmin(profile);
    }
    this.authService.redirectUrl = url;
    this.router.navigateByUrl('/app/login');
    return false;
  }

  checkAdmin(profile: Employee): boolean {
    let b = profile.roles.indexOf("ROLE_ADMIN") !== -1;
    if (!b) {
      this.router.navigateByUrl('/app/dashboard');
    }
    return b;
  }
}
