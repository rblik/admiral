import {Client} from "./client";
import {Tariff} from "./tariff";
import {Agreement} from "./agreement";

export class Project {
  id: number;
  name: string;
  client: Client;
  tariff: Tariff;
  workAgreements: Agreement[];
  isEnabled:boolean;
}
