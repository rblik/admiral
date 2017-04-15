import {Department} from "./department";

export class Employee {
  id: number;
  name: string;
  surname: string;
  passportId: string;
  password: string;
  birthday: string;
  email: string;
  privatePhone: string;
  companyPhone: string;
  roles: string[];
  department: Department
}
