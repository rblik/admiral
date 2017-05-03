import {Client} from "./client";
import {Tariff} from "./tariff";

export class Project {
  id: number;
  name: string;
  client: Client;
  tariff: Tariff;
}
