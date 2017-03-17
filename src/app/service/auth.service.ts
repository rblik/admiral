import {Injectable} from "@angular/core";
import {MockService} from "./mock-service";
import {Worker} from "../model/sworker";

@Injectable()
export class AuthService {

  constructor(private workerService: MockService) {
  }

  private getLoggedWorker() : Worker{
    return this.workerService.getLoggedWorkerInfo();
  }

  public getLoggedName(): string {
    return this.getLoggedWorker().name;
  }
}
