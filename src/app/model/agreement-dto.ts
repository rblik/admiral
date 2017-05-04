import {WorkInfo} from "./work-info";
export class AgreementDto {
  agreementId: number;
  active: boolean;
  tariffId: number;
  tariffAmount: number;
  tariffCurrency: string;
  tariffType: string;
  employeeId: number;
  employeeName: string;
  employeeSurname: string;
  departmentId: number;
  departmentName: string;
  projectId: number;
  projectName: string;
  projectTariffId: number;
  projectTariffAmount: number;
  projectTariffCurrency: string;
  projectTariffType: string;
  clientId: number;
  clientName: string;
  workInfos: WorkInfo[];
}
