import {Component, OnInit} from "@angular/core";
import * as fileSaver from "file-saver";
import {WorkInfo} from "../../model/work-info";
import {SelectItem} from "primeng/primeng";
import {DownloadService} from "../service/download.service";
import {TimeService} from "../../service/time.service";

@Component({
  selector: 'pivotal',
  templateUrl: './pivotal.component.html'
})
export class PivotalComponent implements OnInit{

  constructor(private downloadService: DownloadService, private timeService: TimeService) {
  }

  ngOnInit(): void {
  }

  private selectedType: string = 'xlsx';
  private chosenEmployee;
  private chosenDepartment;
  private chosenProject;
  private chosenClient;
  private infos: WorkInfo[];
  private infosUi: WorkInfo[];
  private types: SelectItem[];
  private error: string;
  private tableVisible: boolean;
  private employeesUi: SelectItem[] = [];
  private departmentsUi: SelectItem[] = [];
  private projectUi: SelectItem[] = [];
  private clientUi: SelectItem[] = [];

  pivotalReport() {
    let employeeId = this.chosenEmployee != null ? this.chosenEmployee.id.toString() : null;
    let departmentId = this.chosenDepartment != null ? this.chosenDepartment.id.toString() : null;
    let projectId = this.chosenProject != null ? this.chosenProject.id.toString() : null;
    let clientId = this.chosenClient != null ? this.chosenClient.id.toString() : null;
    this.downloadService.downloadPivotal(this.selectedType, this.timeService.getDateString(this.timeService.fromDate), this.timeService.getDateString(this.timeService.toDate), employeeId, departmentId, projectId, clientId)
      .subscribe(res => {
          let appType = this.downloadService.getMimeType(this.selectedType);
          let blob = new Blob([res.blob()], {type: appType});
          fileSaver.saveAs(blob, 'pivotal.' + this.selectedType);
        },
        err => {
          this.error = err;
        });
}
