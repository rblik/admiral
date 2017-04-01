import {WorkInfo} from "./work-info";
export class Agreement {
  agreementId: number;
  employeeId: number;
  employeeName: string;
  employeeSurname: string;
  departmentName: string;
  projectId: number;
  projectName: string;
  clientId: number;
  clientName: string;
  workInfos: WorkInfo[];
}