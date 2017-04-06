import {OnInit, Component} from "@angular/core";
import {SessionStorageService} from "ng2-webstorage";
import {AuthService} from "../service/auth.service";
import {Employee} from "../model/employee";

@Component({
  selector: 'main-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavBarComponent implements OnInit{
  private profile: Employee;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.profile = this.authService.getProfile();
    this.authService.profileObserv().subscribe(employee => this.profile = employee);
  }

  logout(): void{
    this.authService.logout();
  }
}
