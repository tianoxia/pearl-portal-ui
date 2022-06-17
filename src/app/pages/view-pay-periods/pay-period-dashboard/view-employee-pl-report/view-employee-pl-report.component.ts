import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe, Location } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { AlertService, DataService } from 'app/_services';
import { EmployeeProfitLossReportResponse, EmployeeProfitLossReportRequest,
  Department, WeeklyEmployeeProfitLossDetail } from 'app/_models';
import { employeeStatus } from 'app/constants/employee-status';
import { employeeCategory } from 'app/constants/employee-category';

@Component({
  selector: 'app-view-employee-pl-report',
  templateUrl: './view-employee-pl-report.component.html',
  styleUrls: ['./view-employee-pl-report.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ViewEmployeeProfitLossReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() employeeProfitLossReportForm: FormGroup;
  @Input() departments: Department[];
  employeeProfitLossReport: EmployeeProfitLossReportResponse;
  subTitle: string;
  startDate: Date;
  weekEnding: Date;
  statuses = employeeStatus;
  categories = employeeCategory;
  selectedEmpType: string;
  selectedEmpCategory: string;
  defaultDept: Department = {
    departmentId: 0,
    name: 'All',
    departmentNumber: '0'
  };
  public weekDataSource : MatTableDataSource<WeeklyEmployeeProfitLossDetail>;
  public displayedColumns = [];
  public displayedWeekColumns = ['weekEnding', 'contractMargin', 'ppMargin', 'salary', 'expenses', 'commission', 'cost', 'pl'];
  expandedElement: WeeklyEmployeeProfitLossDetail | null;
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    //private ecRptService: EmployeeProfitLossReportService,
    private datePipe: DatePipe,
    private dataService: DataService,
    private spinner: NgxSpinnerService) {
      this.employeeProfitLossReportForm = fb.group({
        employeeStatus: 'Active',
        employeeCategory: 'Sales',
        department: this.defaultDept
      });
    }

  ngOnInit() {
    window.scrollTo(0, 0);    
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.weekEnding = new Date(params.get('weekending'));
      this.loadData();
    });
  }

  isWeekEnding(col: string): boolean {
    var regex = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;
    return regex.test(col);
  }
  private loadData() {
    const request: EmployeeProfitLossReportRequest = {
      weekEnding: this.weekEnding,
      employeeStatus: 'Active',
      employeeCategory: 'Sales',
      departmentId: 0
    };
    forkJoin([this.dataService.getAllDepartments(), this.dataService.getEmployeeProfitLossReport(request)])
      .subscribe(([departments, EmployeeProfitLossReport]) => {
        this.departments = departments as Department[];
        this.employeeProfitLossReport = EmployeeProfitLossReport as EmployeeProfitLossReportResponse;
        //this.dataSource.sort = this.sort;
        this.departments.splice(0, 0, this.defaultDept);
        this.displayedColumns.push('name');
        if (this.employeeProfitLossReport && this.employeeProfitLossReport.weelyEmployeeProfitLossTotal
          && this.employeeProfitLossReport.weelyEmployeeProfitLossTotal.length > 0) {
          for (let wk of this.employeeProfitLossReport.weelyEmployeeProfitLossTotal) {
            this.displayedColumns.push(this.datePipe.transform(wk.weekEnding, 'MM/dd/yyyy'));
          }          
        this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' ('+this.employeeProfitLossReport.employeeProfitLossReportDetails.length+' Records)';
        } else {
          this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' (0 Records)';
        }
        this.displayedColumns.push('mtdCost', 'mtdContractGrossMargin', 'ytdContractGrossMargin', 'mtdPermPlacementGrossMargin',
        'ytdPermPlacementGrossMargin','mtdGrossMargin','ytdGrossMargin');
        //this.location.replaceState(this.location.path().split('?')[0], '');
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  compareCategories(o1: any, o2: any) {
    return (o1 == o2);
  }
  public showReport = (employeeProfitLossReportFormValue) => {
    if (this.employeeProfitLossReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(employeeProfitLossReportFormValue);
    }
  }
  selectEmployeeType(event: MatSelectChange) {
    this.selectedEmpType = event.value;
              
  }
  selectEmployeeCategory(event: MatSelectChange) {
    this.selectedEmpCategory = event.value;
  }
  private executeGetReport = (employeeProfitLossReportFormValue) => {
    this.displayedColumns = [];
    const request: EmployeeProfitLossReportRequest = {
      departmentId: employeeProfitLossReportFormValue.department.departmentId,
      weekEnding: this.weekEnding,
      employeeStatus: employeeProfitLossReportFormValue.employeeStatus,
      employeeCategory: employeeProfitLossReportFormValue.employeeCategory
    };
    this.dataService.getEmployeeProfitLossReport(request)
      .subscribe((res: EmployeeProfitLossReportResponse) => {
        window.scrollTo(0, 0);
        this.employeeProfitLossReport = res as EmployeeProfitLossReportResponse;
        this.displayedColumns.push('name');
        if (this.employeeProfitLossReport && this.employeeProfitLossReport.weelyEmployeeProfitLossTotal
          && this.employeeProfitLossReport.weelyEmployeeProfitLossTotal.length > 0) {
          for (let wk of this.employeeProfitLossReport.weelyEmployeeProfitLossTotal) {
            this.displayedColumns.push(this.datePipe.transform(wk.weekEnding, 'MM/dd/yyyy'));
          }          
          //this.dataSource.sort = this.sort;
          this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' ('+this.employeeProfitLossReport.employeeProfitLossReportDetails.length+' Records)';
        } else {
          this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' (0 Records)';
        }
        this.displayedColumns.push('mtdCost', 'mtdContractGrossMargin', 'ytdContractGrossMargin', 'mtdPermPlacementGrossMargin',
        'ytdPermPlacementGrossMargin','mtdGrossMargin','ytdGrossMargin');
        this.spinner.hide();
        //this.location.replaceState(this.location.path().split('?')[0], '');
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      }) 
    );
  }
  compareDepartments(o1: any, o2: any) {
    return (o1.name == o2.name && o1.departmentId == o2.departmentId);
  }
  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }
  expandCollapse(weeklyData: WeeklyEmployeeProfitLossDetail) {
    if (this.expandedElement === weeklyData) {
      this.expandedElement = null;
    } else {
      this.weekDataSource = new MatTableDataSource([weeklyData]);
      this.expandedElement = weeklyData;
    }
  }
}
