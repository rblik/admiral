import {Component} from "@angular/core";
import {SelectItem} from "primeng/primeng";

@Component({
  selector: 'admin-report',
  templateUrl: 'report.component.html'
})
export class ReportComponent {
  startDate: Date;
  endDate: Date;

  minDate: Date;

  maxDate: Date;

  invalidDates: Array<Date>;

  types: SelectItem[];

  selectedType: string;

  constructor() {
    this.types = [];
    this.types.push({label: 'PDF', value: 'pdf'});
    this.types.push({label: 'Excel', value: 'xls'});
  }

  missingDaysReport() {
    window.open("http://localhost:8080/admin/" + this.selectedType +
      "/missing?from=" +
      this.dateToString(this.startDate) + "&to=" +
      this.dateToString(this.endDate));  }

  partialDaysReport() {
    window.open("http://localhost:8080/admin/" + this.selectedType +
      "/partial?from=" +
      this.dateToString(this.startDate) + "&to=" +
      this.dateToString(this.endDate) + "&limit=" + '7');  }

  pivotalReport() {
    window.open("http://localhost:8080/admin/" + this.selectedType +
      "/pivotal?from=" +
      this.dateToString(this.startDate) + "&to=" +
      this.dateToString(this.endDate));
  }

  private dateToString(date: Date): string {

    let s = '';
    s += date.getFullYear() + '-';
    if (date.getMonth() + 1 < 10)
      s += '0';
    s += date.getMonth()+1 + '-';
    if (date.getDate() < 10)
      s += '0';
    s += date.getDate();
    return s;
  }
}
