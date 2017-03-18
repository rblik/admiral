import {Component, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";
import {Worker} from "../model/worker";
import {TimeService} from "../service/time.service";
import {DailyWork} from "../model/daily-work";
import {WorkService} from "../service/work.service";
import * as _ from 'lodash';

@Component({
  selector: 'worker-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  private worker: Worker;
  private currentSunday: Date;
  private currentSaturday: Date;
  private timeOffset: number;
  private weekWorks: DailyWork[][];

  constructor(private timeService: TimeService, private authService: AuthService, private workService: WorkService) {
  }

  ngOnInit(): void {
    this.timeOffset = 0;
    this.worker = this.authService.getLoggedWorker();
    this.initWeekBorders(this.timeOffset);
    this.weekWorks = this.workService.getWorkHoursForWeek(this.currentSunday, this.currentSaturday);
  }

  private initWeekBorders(offset: number) {
    this.currentSunday = this.timeService.getWeekDay(offset);
    this.currentSaturday = this.timeService.getWeekDay(offset + 6);
  }

  moveWeekForward() {
    this.timeOffset += 7;
    this.initWeekBorders(this.timeOffset);
    this.weekWorks = this.workService.getWorkHoursForWeek(this.currentSunday, this.currentSaturday);
  }

  moveWeekBack() {
    this.timeOffset -= 7;
    this.initWeekBorders(this.timeOffset);
    this.weekWorks = this.workService.getWorkHoursForWeek(this.currentSunday, this.currentSaturday);
  }
}
