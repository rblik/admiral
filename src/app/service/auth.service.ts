import {Injectable} from "@angular/core";
import {MockService} from "./mock-service";
import {Worker} from "../model/worker";
import {Company} from "../model/company";

@Injectable()
export class AuthService {

  constructor(private workerService: MockService) {
  }

  public getLoggedWorker() : Worker{
    return this.workerService.getLoggedWorkerInfo();
  }

  public getLoggedName(): string {
    return this.getLoggedWorker().name;
  }

}
