import {Employee} from "./employee";
import {Tariff} from "./tariff";
export class Agreement {
  id: number;
  active: boolean;
  employee: Employee;
  tariff: Tariff;
}
