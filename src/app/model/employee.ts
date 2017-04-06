import {Department} from "./department";

export class Employee {
  id: number;
  name: string;
  surname: string;
  passportId: string;
  birthday: string;
  email: string;
  privatePhone: string;
  roles: string[];
  department: Department
}
