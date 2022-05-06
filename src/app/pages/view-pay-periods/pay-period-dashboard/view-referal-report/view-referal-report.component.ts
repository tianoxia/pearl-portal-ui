import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService } from 'app/_services';
import { ReferalReportResponse, ReferalReportRequest,
 Recruiter, CustomReportTotals } from 'app/_models';

@Component({
  selector: 'app-view-referal-report',
  templateUrl: './view-referal-report.component.html',
  styleUrls: ['./view-referal-report.component.css']
})
export class ViewReferalReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() referalReportForm: FormGroup;
  @Input() recruiters: Recruiter[];
  subTitle: string;
  startDate: Date;
  sum: CustomReportTotals;
  weekEnding: Date;
  payFrequency: string;
  floatLabelControl = new FormControl('auto');
  defaultRecruiter: Recruiter;
  public displayedColumns = ['assignment', 'referer',
  'secondReferer', 'margin', 'refererRate', 'secondRefererRate', 'refererFee', 'secondRefererFee'];
  public dataSource = new MatTableDataSource<ReferalReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private dataService: DataService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService) {
      this.defaultRecruiter = new Recruiter();
      this.defaultRecruiter.firstName = 'All';
      this.defaultRecruiter.lastName = '';
      this.defaultRecruiter.employeeId = 0;
      this.referalReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        recruiter: this.defaultRecruiter
      });
      this.sum = new CustomReportTotals();
    }

  ngOnInit() {
    window.scrollTo(0, 0);    
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.weekEnding = new Date(params.get('weekending'));
      this.payFrequency = params.get('payfrequency');
      this.loadData();
    });
  }

  private loadData() {
    const request: ReferalReportRequest = {
      employeeId: 0,
      weekEnding: this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd')
    };
    forkJoin([this.dataService.getAllRecruiters(), this.dataService.getReferalReport(request)])
      .subscribe(([referers, referalReport]) => {
        this.dataSource.data = referalReport as ReferalReportResponse[];
        this.dataSource.sort = this.sort;
        if (this.dataSource.data.length > 0) {
          this.recruiters = (referers as Recruiter[]).filter(r => r.isReferer === true);
          this.recruiters.splice(0, 0, this.defaultRecruiter);
          this.referalReportForm.get('recruiter').patchValue(this.defaultRecruiter);
          for (let row of this.dataSource.data) {
            if (row.refererFee !== 0) this.sum.totalRefFee += row.refererFee;
            if (row.secondRefererFee !== 0) this.sum.totalSecondRefFee += row.secondRefererFee;
            if (row.margin !== 0) this.sum.totalMargin += row.margin;
          }
          this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.dataSource.data.length+' Records)';
        } else {
          this.alertService.error('No Record Found');
        }
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  compareRecruiters(o1: any, o2: any) {
    return (o1.firstName == o2.firstName && o1.lastName == o2.lastName && o1.employeeId == o2.employeeId);
  }
  public showReport = (referalReportFormValue) => {
    this.alertService.clear();
    if (this.referalReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(referalReportFormValue);
    }
  }

  private executeGetReport = (referalReportFormValue) => {
    this.sum = new CustomReportTotals();
    const request: ReferalReportRequest = {
      employeeId: referalReportFormValue.recruiter.employeeId,
      weekEnding: this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd')
    };
    this.dataService.getReferalReport(request)
      .subscribe((res: ReferalReportResponse[]) => {
        window.scrollTo(0, 0);
        this.dataSource.data = res;
        this.dataSource.sort = this.sort;
        if (this.dataSource.data.length > 0) {
          for (let row of this.dataSource.data) {
            if (row.refererFee !== 0) this.sum.totalRefFee += row.refererFee;
            if (row.secondRefererFee !== 0) this.sum.totalSecondRefFee += row.secondRefererFee;
            if (row.margin !== 0) this.sum.totalMargin += row.margin;
          }
        } else {
          this.alertService.error('No Record Found');
        }
        this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.dataSource.data.length+' Records)';
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
}
