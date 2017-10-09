import {Address} from "./address";
import {Project} from "./project";

export class Client {
  id: number;
  companyNumber: string;
  clientNumber: string;
  isEnabled:boolean;
  name: string;
  phones: string[];
  projects: Project[];
  addresses: Address[];
}
