import {Component, OnDestroy, OnInit} from "@angular/core";
import {EmployeeService} from "../../service/employee.service";
import {SelectItem} from "primeng/primeng";
import {Subscription} from "rxjs/Subscription";
import {Employee} from "../../../model/employee";
import {Department} from "../../../model/department";
import {ActivatedRoute, Router} from "@angular/router";
import {TimeService} from "../../../service/time.service";
import {AdminMonthInfoService} from "../../service/admin-month-info.service";
import {IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings} from 'angular-2-dropdown-multiselect';

@Component({
  selector: 'admin-dashboard-header',
  templateUrl: './admin-dashboard-header.component.html'
})
export class AdminDashboardHeaderComponent implements OnInit, OnDestroy{

  private employees: Employee[];
  private employeesUi: SelectItem[] = [];
  private employeeIds: number[];
  private departmentsUi: SelectItem[] = [];
  private chosenEmployee: Employee;
  private chosenDepartment: Department;
  private error: string;
  private getEmployeesSubscription: Subscription;
  private updateSumHoursForMonthSubscription: Subscription;
  private searchDate: Date;
  private message: string;
  private employeesCheckboxOptions: IMultiSelectOption[] = [];
  private employeesCheckboxSettings: IMultiSelectSettings;
  private employeesCheckboxTexts: IMultiSelectTexts;
  private he: any;

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private route: ActivatedRoute,
              private monthInfoService: AdminMonthInfoService,
              private timeService: TimeService) {
    this.fixDropdownCheckbox();
  }

  ngOnInit(): void {
    this.he = {
      firstDayOfWeek: 0,
      dayNamesMin: ["א'","ב'","ג'","ד'","ה'","ו'","ש'"],
      monthNames: [ "ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר" ]
    };
    this.message = '';
    $("#errorSuccessHoursField").click(function () {
      $("#errorSuccessHoursField").text('');
    });
    this.departmentsUi.push({label: "בחר צוות", value: null});
    this.employeesUi.push({label: "בחר עובד", value: null});
    this.getEmployees();
    this.searchDate = new Date();
  }

  ngOnDestroy(): void {
    if (this.getEmployeesSubscription) this.getEmployeesSubscription.unsubscribe();
    if (this.updateSumHoursForMonthSubscription) this.updateSumHoursForMonthSubscription.unsubscribe();
  }

  getEmployees(): void {
    this.getEmployeesSubscription = this.employeeService.getAll().subscribe(employees => {
      this.employees = employees;
      this.fillDropDownList(employees);
      this.getEmployeesUi(this.chosenDepartment);
      this.getDepartmentsUi(this.employees);
    }, error => {
      this.error = error
    });
  }

  private fixDropdownCheckbox() {
    this.employeesCheckboxOptions = [];
    this.employeeIds = [];
    this.employeesCheckboxSettings = {
      enableSearch: true,
      displayAllSelectedText: false,
      dynamicTitleMaxItems: 0,
      showCheckAll: true,
      showUncheckAll: true
    };
    this.employeesCheckboxTexts = {
      checkAll: 'בחר כולם',
      uncheckAll: 'בטל בחירה',
      checked: 'עובד נבחר',
      checkedPlural: 'עובדים נבחרו',
      searchPlaceholder: 'חפש',
      defaultTitle: 'בחר עובד',
      allSelected: 'כלם נבחרו',
    };
  }

  private fillDropDownList(employees: Employee[]) {
    employees.forEach(employee => {
      this.employeesCheckboxOptions.push({id: employee.id, name: employee.surname + ' ' + employee.name});
    });
  }

  getDepartmentsUi(employees: Array<Employee>) {
    let arr = [];
    employees.forEach(employee => {
      if (arr.indexOf(employee.department.id) == -1) {
        this.departmentsUi.push({
          label: employee.department.name,
          value: employee.department
        });
        arr.push(employee.department.id);
      }
    });
  }

  showUpdatingMonthHoursForm() {
    let updateSumMonthHoursFormOpen = document.getElementById('updateSumMonthHoursFormOpen');
    if (updateSumMonthHoursFormOpen != null) {
      updateSumMonthHoursFormOpen.click();
    }
  }

  closeUpdatingMonthHoursForm() {
    let updateSumMonthHoursFormClose = document.getElementById('updateSumMonthHoursFormClose');
    if (updateSumMonthHoursFormClose != null) {
      updateSumMonthHoursFormClose.click();
    }
  }

  updateSumHoursForMonth(hoursSum: string) {
    let date = this.timeService.getDateString(this.searchDate);
    this.updateSumHoursForMonthSubscription = this.monthInfoService.updateSumHoursForMonth(date, this.employeeIds, +hoursSum)
      .subscribe(monthInfos => {
        this.message = 'הנתונים רועננו';
        $("#errorSuccessHoursField").css('color', 'green');
      }, err => {
        this.message = err;
        $("#errorSuccessHoursField").css('color', 'red');
      });
    this.closeUpdatingMonthHoursForm();
    this.router.navigate(['/app/admin/dashboard']);
  }

  getEmployeesUi(department: Department) {
    this.chosenEmployee = null;
    this.employeesUi = [];
    let filter = this.employees.filter(function (employee) {
      return department != null ? employee.department.id === department.id : true;
    });
    this.employeesUi.push({label: "בחר עובד", value: null});
    filter.forEach(employee => this.employeesUi.push({label: employee.name + ' ' + employee.surname, value: employee}));
  }

  showDashboard(chosenEmployee: Employee){
    let date = this.timeService.getDateString(this.searchDate);
    this.router.navigate([chosenEmployee.id], {relativeTo: this.route, queryParams: {date: date}});
  }
}
