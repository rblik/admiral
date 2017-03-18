import {Injectable} from "@angular/core";
import {Worker} from "../model/worker";
import {Company} from "../model/company";
import {SubProject} from "../model/subproject";
import {Address} from "../model/address";

@Injectable()
export class MockService {

  getLoggedWorkerInfo(): Worker{
    let company = new Company();
    company.companyId = 1;
    company.companyTel = '073-286-5544';
    company.name = 'Naya Technologies';
    company.address = new Address();
    company.address.town = 'Tel Aviv';
    company.address.street = 'Ha-Nadiv';
    company.address.house = 71;
    let subProj = new SubProject();
    subProj.name = "Office";
    subProj.company = company;
    let subProj1 = new SubProject();
    subProj1.name = 'Home';
    subProj1.company = company;
    let worker = new Worker();
    worker.workerId = 131;
    worker.name = 'Jonathan';
    worker.surname = 'Blik';
    worker.birthday = new Date(1989, 11, 19);
    worker.subProjects = [subProj, subProj1];
    worker.email = 'rblick@bk.ru';
    worker.passportId = 336452404;
    worker.workerTel = '058-671-2234';
    return worker;
  }
}
