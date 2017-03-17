import {Company} from "./company";

export class Worker {
  workerId: number;
  name: string;
  surname: string;
  passportId: number;
  birthday: Date;
  email: string;
  workerTel: string;
  company: Company[];
}
