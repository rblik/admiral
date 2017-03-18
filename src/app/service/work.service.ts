import {Injectable} from "@angular/core";
import {MockService} from "./mock-service";
import {DailyWork} from "../model/daily-work";
import {Worker} from "../model/worker";

@Injectable()
export class WorkService {

  worker: Worker;

  constructor(private mockService: MockService) {
    this.worker = this.mockService.getLoggedWorkerInfo();
  }

  getWorkHoursForWeek(sundayDate: Date, saturdayDate: Date): DailyWork[][] {
    return this.transform(this.mockService.getWeekWork(sundayDate, saturdayDate));
  }

  private transform(value: Array<DailyWork>): Array<any> {
    console.log("value = " + value.length);
    let arrArr: DailyWork[][] = [];
    this.worker.subProjects.forEach(subProj => {
      let filtered = value.filter(function (work) {
        return work.subProject.subProjectId == subProj.subProjectId;
      });
      console.log("filtered = " + filtered.length);
      let resultArr = [];
      for (let i = 0; i < filtered.length; i++) {
        let day = new Date(filtered[i].date).getDay();
        resultArr[day] = filtered[i];
      }
      console.log("resultArr = " + resultArr.length);
      for (let i = 0; i < 7; i++) {
        if (resultArr[i] == null) {
          resultArr[i] = {
            subProject: subProj,
            date: '',
            hours: 0,
            absence: ''
          };
        }
      }
      arrArr.push(resultArr);
    });
    return arrArr;
  }
}
