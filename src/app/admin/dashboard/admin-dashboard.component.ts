import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {SessionStorageService} from "ng2-webstorage";
import {WorkInfoService} from "../../service/work-info.service";
import {LockService} from "../../service/lock.service";
import {TimeService} from "../../service/time.service";
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import {Employee} from "../../model/employee";
import {EmployeeService} from "../service/employee.service";

@Component({
  selector: 'admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, OnDestroy{
  private routeParamsSubscription: Subscription;
  private sumByDayArr: number[];
  private clientsUi: string[];
  private clientsCheckboxOptions: IMultiSelectOption[];
  private clientsCheckboxSettings: IMultiSelectSettings;
  private clientsCheckboxTexts: IMultiSelectTexts;
  private employee: Employee;

  constructor(private route: ActivatedRoute, private employeeService: EmployeeService, private timeService: TimeService, private lockService: LockService, private workService: WorkInfoService, private sessionStorageService: SessionStorageService) {
    this.sumByDayArr = [];
    this.fixDropdownCheckbox();
  }

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.switchMap((params: Params) =>
      this.employeeService.get(params['employeeId'])).subscribe(employee => {
      this.employee = employee;
    });
  }

  private fixDropdownCheckbox() {
    this.clientsCheckboxOptions = [];
    this.clientsUi = [];
    this.clientsCheckboxSettings = {
      enableSearch: true,
      displayAllSelectedText: false,
      dynamicTitleMaxItems: 0,
      showCheckAll: true,
      showUncheckAll: true
    };
    this.clientsCheckboxTexts = {
      checkAll: 'בחר כולם',
      uncheckAll: 'בטל בחירה',
      checked: 'לקוח נבחר',
      checkedPlural: 'לקוחות נבחרו',
      searchPlaceholder: 'חפש',
      defaultTitle: 'בחר לקוח',
      allSelected: 'כלם נבחרו',
    };
  }

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) this.routeParamsSubscription.unsubscribe();
  }
}
