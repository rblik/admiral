import {Department} from "./department";

export class Employee {
  id: number;
  enabled: boolean;
  name: string;
  surname: string;
  passportId: string;
  employeeNumber: string;
  password: string;
  birthday: string;
  email: string;
  privatePhone: string;
  companyPhone: string;
  roles: string[];
  department: Department
}
