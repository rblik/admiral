import {Injectable} from "@angular/core";
import {MockService} from "./mock-service";
import {DailyWork} from "../model/daily-work";

@Injectable()
export class WorkService {

  constructor(private mockService: MockService) {
  }

  getWorkHoursForWeek(sundayDate: Date, saturdayDate: Date): DailyWork[][] {
    return this.transform(this.mockService.getWeekWork(sundayDate, saturdayDate));
  }

  private transform(value: Array<DailyWork>): Array<any> {
    let mapped = value.map(obj => {
      return {'projId': obj.subProject.subProjectId, 'obj': obj}
    });
    const groupedObj = mapped.reduce((prev, cur)=> {
      if(!prev[cur['projId']]) {
        prev[cur['projId']] = [cur];
      } else {
        prev[cur['projId']].push(cur);
      }
      return prev;
    }, {});
    return Object.keys(groupedObj).map(key => groupedObj[key]);
  }
}
