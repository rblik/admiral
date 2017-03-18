import {Injectable} from "@angular/core";
import {Worker} from "../model/worker";
import {Company} from "../model/company";
import {SubProject} from "../model/subproject";
import {Address} from "../model/address";
import {DailyWork} from "../model/daily-work";

@Injectable()
export class MockService {

  company: Company;
  subProj: SubProject;
  subProj1: SubProject;
  worker: Worker;
  dailyWorks: DailyWork[];

  constructor() {
    this.company = new Company();
    this.company.companyId = 1;
    this.company.companyTel = '073-286-5544';
    this.company.name = 'Naya Technologies';
    this.company.address = new Address();
    this.company.address.town = 'Tel Aviv';
    this.company.address.street = 'Ha-Nadiv';
    this.company.address.house = 71;
    this.subProj = new SubProject();
    this.subProj.subProjectId = 1;
    this.subProj.name = "Office";
    this.subProj.company = this.company;
    this.subProj1 = new SubProject();
    this.subProj1.subProjectId = 2;
    this.subProj1.name = 'Home';
    this.subProj1.company = this.company;
    this.worker = new Worker();
    this.worker.workerId = 131;
    this.worker.name = 'Jonathan';
    this.worker.surname = 'Blik';
    this.worker.birthday = new Date(1989, 11, 19);
    this.worker.subProjects = [this.subProj, this.subProj1];
    this.worker.email = 'rblick@bk.ru';
    this.worker.passportId = 336452404;
    this.worker.workerTel = '058-671-2234';
    let d1 = new DailyWork();
    d1.date = '2017-03-18';
    d1.hours = 3;
    d1.subProject = this.subProj;
    let d2 = new DailyWork();
    d2.date = '2017-03-16';
    d2.hours = 8;
    d2.subProject = this.subProj;
    let d3 = new DailyWork();
    d3.date = '2017-03-14';
    d3.hours = 0;
    d3.subProject = this.subProj1;
    d3.absence = 'holiday';
    let d4 = new DailyWork();
    d4.date = '2017-03-10';
    d4.hours = 8;
    d4.subProject = this.subProj;
    let d5 = new DailyWork();
    d4.date = '2017-03-17';
    d4.hours = 6;
    d4.subProject = this.subProj1;
    this.dailyWorks = [d1, d2, d3, d4];
  }

  getLoggedWorkerInfo(): Worker {
    return this.worker;
  }

  getWeekWork(sundayDate: Date, saturdayDate: Date): DailyWork[] {

    return this.dailyWorks.filter(function (work) {
      return (new Date(work.date)) >= sundayDate && (new Date(work.date)) <= saturdayDate;
    });
  }
}
