import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe, Location } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { AlertService, LeaderboardReportService } from 'app/_services';
import { LeaderboardReportResponse, LeaderboardReportRequest, CustomReportTotals } from 'app/_models';
import { employeeStatus } from 'app/constants/employee-status';
import { employeeCategory } from 'app/constants/employee-category';

@Component({
  selector: 'app-view-leaderboard-report',
  templateUrl: './view-leaderboard-report.component.html',
  styleUrls: ['./view-leaderboard-report.component.css']
})
export class ViewLeaderboardReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() leaderboardReportForm: FormGroup;
  leaderboardReport: LeaderboardReportResponse;
  subTitle: string;
  startDate: Date;
  sum: CustomReportTotals;
  weekEnding: Date;
  statuses = employeeStatus;
  categories = employeeCategory;
  selectedEmpType: string;
  selectedEmpCategory: string;
  floatLabelControl = new FormControl('auto');
  public displayedColumns: string[];
  
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private lbRptService: LeaderboardReportService,
    private datePipe: DatePipe,
    private location: Location,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.leaderboardReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        employeeStatus: 'Active',
        employeeCategory: 'Sales',

      });
      this.displayedColumns = [];
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
    const request: LeaderboardReportRequest = {
      weekEnding: this.weekEnding,
      employeeStatus: 'Active',
      employeeCategory: 'Sales'
    };
    this.lbRptService.getLeaderboardReport(request)
      .subscribe((leaderboardReport: LeaderboardReportResponse) => {
        this.leaderboardReport = leaderboardReport;
        //this.dataSource.sort = this.sort;
        this.displayedColumns.push('Name');
        if (this.leaderboardReport && this.leaderboardReport.weelyLeaderboardTotal
          && this.leaderboardReport.weelyLeaderboardTotal.length > 0) {
          for (let wk of this.leaderboardReport.weelyLeaderboardTotal) {
            this.displayedColumns.push(this.datePipe.transform(wk.weekEnding, 'MM/dd/yyyy'));
          }          
        this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' ('+this.leaderboardReport.leaderboardReportDetails.length+' Records)';
        } else {
          this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' (0 Records)';
        }
        this.displayedColumns.push('mtdContractGrossMargin', 'ytdContractGrossMargin', 'mtdPermPlacementGrossMargin',
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
  public showReport = (leaderboardReportFormValue) => {
    if (this.leaderboardReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(leaderboardReportFormValue);
    }
  }
  selectEmployeeType(event: MatSelectChange) {
    this.selectedEmpType = event.value;
              
  }
  selectEmployeeCategory(event: MatSelectChange) {
    this.selectedEmpCategory = event.value;
  }
  private executeGetReport = (leaderboardReportFormValue) => {
    this.displayedColumns = [];
    const request: LeaderboardReportRequest = {
      weekEnding: this.weekEnding,
      employeeStatus: leaderboardReportFormValue.employeeStatus,
      employeeCategory: leaderboardReportFormValue.employeeCategory
    };
    this.lbRptService.getLeaderboardReport(request)
      .subscribe((res: LeaderboardReportResponse) => {
        window.scrollTo(0, 0);
        this.leaderboardReport = res as LeaderboardReportResponse;
        this.displayedColumns.push('Name');
        if (this.leaderboardReport && this.leaderboardReport.weelyLeaderboardTotal
          && this.leaderboardReport.weelyLeaderboardTotal.length > 0) {
          for (let wk of this.leaderboardReport.weelyLeaderboardTotal) {
            this.displayedColumns.push(this.datePipe.transform(wk.weekEnding, 'MM/dd/yyyy'));
          }          
        //this.dataSource.sort = this.sort;
        this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' ('+this.leaderboardReport.leaderboardReportDetails.length+' Records)';
        } else {
          this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
        ' (0 Records)';
        }
        this.displayedColumns.push('mtdContractGrossMargin', 'ytdContractGrossMargin', 'mtdPermPlacementGrossMargin',
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
  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }
}
