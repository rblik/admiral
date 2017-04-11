import {Component, OnInit} from "@angular/core";
import {SelectItem} from "primeng/primeng";
import {DownloadService} from "../service/download.service";
import * as fileSaver from "file-saver";
import {TimeService} from "../../service/time.service";

@Component({
  selector: 'admin-report',
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit{

  private startDate: Date;
  private endDate: Date;
  private types: SelectItem[];
  private selectedType: string = 'xlsx';
  private error: string;
  private monthOffset: number;

  constructor(private downloadService: DownloadService, private timeService: TimeService) {
    this.types = [];
    this.types.push({label: 'PDF', value: 'pdf'});
    this.types.push({label: 'Excel', value: 'xlsx'});
    this.monthOffset = 0;
  }

  ngOnInit(): void {
    this.setDefaultDateRange();
  }

  setDefaultDateRange() {
    this.timeService.setDefaultDateRange(this.monthOffset);
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

  pivotalReport() {
    this.downloadService.downloadPivotal(this.selectedType, this.dateToString(this.startDate), this.dateToString(this.endDate))
      .subscribe(res => {
        let appType = this.getMimeType(this.selectedType);
        let blob = new Blob([res.blob()], {type: appType});
        fileSaver.saveAs(blob, 'pivotal.' + this.selectedType);
      },
      err => {
        this.error = err;
      });
  }

  private dateToString(date: Date): string {

    let s = '';
    s += date.getFullYear() + '-';
    if (date.getMonth() + 1 < 10)
      s += '0';
    s += date.getMonth() + 1 + '-';
    if (date.getDate() < 10)
      s += '0';
    s += date.getDate();
    return s;
  }

  private getMimeType(type: string): string {
    let apType;
    if (type === 'pdf') {
      apType = 'pdf';
    } else if (type === 'xls') {
      apType = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    return 'application/' + apType;
  }
}
