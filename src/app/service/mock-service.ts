import {Injectable} from "@angular/core";
import {Worker} from "../model/sworker";
import {Company} from "../model/company";

@Injectable()
export class MockService {

  getLoggedWorkerInfo(): Worker{
    let company = new Company();
    company.companyId = 1;
    company.companyTel = '073-286-5544';
    company.name = 'Naya Technologies';
    company.departments = [
      'Office',
      'Studies'
    ];
    company.address.town = 'Tel Aviv';
    company.address.street = 'Ha-Nadiv';
    company.address.house = 71;
    let worker = new Worker();
    worker.workerId = 131;
    worker.name = 'Jonathan';
    worker.surname = 'Blik';
    worker.birthday = new Date(1989, 12, 18);
    worker.company = [company];
    worker.email = 'rblick@bk.ru';
    worker.passportId = 336452404;
    worker.workerTel = '058-671-2234';
    return worker;
  }
}
