import {SubProject} from "./subproject";

export class Worker {
  workerId: number;
  name: string;
  surname: string;
  passportId: number;
  birthday: Date;
  email: string;
  workerTel: string;
  subProjects: SubProject[];
}
