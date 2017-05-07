import {Component, OnDestroy} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  title = 'app works!!!';

  private sub: any;
  constructor(private slimLoadingBarService: SlimLoadingBarService, private router: Router) {

    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.slimLoadingBarService.start();
      } else if ( event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError) {
        this.slimLoadingBarService.complete();
      }
    }, (error: any) => {
      this.slimLoadingBarService.complete();
    });
  }

  ngOnDestroy(): any {
    this.sub.unsubscribe();
  }
}
