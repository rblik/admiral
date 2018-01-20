import {Component, OnInit} from "@angular/core";
import {SelectItem} from "primeng/primeng";
import {TimeService} from "../../service/time.service";
import {MonthInfoService} from "../../service/month-info.service";

@Component({
  selector: 'admin-report',
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit{

  private startDate: Date;
  private endDate: Date;
  private types: SelectItem[];
  private monthOffset: number;
  private he: any;
  private defaultMonthHours:number=0;

  constructor(private timeService: TimeService,private monthInfoService: MonthInfoService) {
    this.types = [];
    this.types.push({label: 'PDF', value: 'pdf'});
    this.types.push({label: 'Excel', value: 'xlsx'});
    this.monthOffset = 0;
  }

  ngOnInit(): void {
    this.he = {
      firstDayOfWeek: 0,
      dayNamesMin: ["א'","ב'","ג'","ד'","ה'","ו'","ש'"],
      monthNames: [ "ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר" ]
    };
    this.setDefaultDateRange();
  }

  setDefaultDateRange() {
    this.timeService.setDefaultDateRange(this.monthOffset);
    this.monthInfoService.getMonthInfo(this.timeService.fromDate.getFullYear(), this.timeService.fromDate.getMonth())
      .subscribe(monthInfo=>this.defaultMonthHours=monthInfo.hoursSum);
    this.startDate = this.timeService.fromDate;
    this.endDate= this.timeService.toDate;
  }

  populateTimeServiceWithDates() {
    this.timeService.fromDate = this.startDate;
    this.timeService.toDate = this.endDate;
  }

  moveMonth(offset: number) {
    this.monthOffset += offset;
    this.setDefaultDateRange();
  }
}
