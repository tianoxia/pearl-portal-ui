import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, AuthenticationService, DataService, ExportService } from 'app/_services';
import {
  HeadCountReportResponse, HeadCountReportRequest,
  Department, Recruiter, Client, HeadCountByDepartment, HeadCountByClientDepartment, Resource, PermissionType
} from 'app/_models';

@Component({
  selector: 'app-view-headcount-report',
  templateUrl: './view-headcount-report.component.html',
  styleUrls: ['./view-headcount-report.component.css']
})
export class ViewHeadCountReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() headCountReportForm: FormGroup;
  @Input() departments: Department[];
  @Input() clients: Client[];
  @Input() recruiters: Recruiter[];
  subTitle: string;
  headCountReportData: HeadCountReportResponse;
  weekEnding: Date;
  fromDate: Date;
  toDate: Date;
  payFrequency: string;
  defaultRecruiter: Recruiter;
  public displayedColumns = ['client', 'contractorCount', 'hours', 'revenue', 'grossMargin'];
  public dataSource = new MatTableDataSource<HeadCountByDepartment>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private dataService: DataService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private spinner: NgxSpinnerService) {
    this.defaultRecruiter = new Recruiter();
    this.defaultRecruiter.firstName = 'All';
    this.defaultRecruiter.lastName = '';
    this.defaultRecruiter.employeeId = 0;
    this.headCountReportForm = fb.group({
      fromDate: '',
      toDate: '',
      recruiter: this.defaultRecruiter
    });
  }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.HeadcountReport && e.permissionTypes.includes(PermissionType.VIEW))) {
        this.router.navigateByUrl("/unauthorized");
      }
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.weekEnding = new Date(params.get('weekending'));
      this.payFrequency = params.get('payfrequency');
      this.loadData();
    });
  }

  private loadData() {
    const request: HeadCountReportRequest = {
      employeeId: 0,
      weekEnding: this.weekEnding,
      payFrequency: this.payFrequency
    };
    forkJoin([this.dataService.getAllRecruiters(), this.dataService.getHeadCountReport(request)])
      .subscribe(([recruiters, headCountReports]) => {
        this.headCountReportData = headCountReports as HeadCountReportResponse;
        this.dataSource.data = this.headCountReportData.headCountsByDepartment as HeadCountByDepartment[];
        this.recruiters = recruiters as Recruiter[];
          this.recruiters.splice(0, 0, this.defaultRecruiter);
          this.headCountReportForm.get('recruiter').patchValue(this.defaultRecruiter);
        if (this.dataSource.data.length > 0) {          
          this.subTitle = 'for Pay Period Ending ' + this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') + ' (' + this.dataSource.data.length + ' Records)';
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
  public showReport = (headCountReportFormValue) => {
    if (this.headCountReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(headCountReportFormValue);
    }
  }

  private executeGetReport = (headCountReportFormValue) => {
    const request: HeadCountReportRequest = {
      employeeId: headCountReportFormValue.recruiter.employeeId,
      weekEnding: this.weekEnding,
      payFrequency: this.payFrequency
    };
    if (headCountReportFormValue.fromDate) {
      this.fromDate = request.fromDate = headCountReportFormValue.fromDate;
      this.toDate = request.toDate = headCountReportFormValue.toDate;
    }
    this.dataService.getHeadCountReport(request)
      .subscribe((res: HeadCountReportResponse) => {
        window.scrollTo(0, 0);
        this.headCountReportData = res;
        this.dataSource.data = res.headCountsByDepartment as HeadCountByDepartment[];
        this.dataSource.sort = this.sort;
        if (this.fromDate) {
          this.subTitle = 'for date between ' + this.datePipe.transform(this.fromDate, 'MM/dd/yyyy') +
          ' - ' + this.datePipe.transform(this.toDate, 'MM/dd/yyyy') + ' (' + this.dataSource.data.length + ' Records)';
        } else {
          this.subTitle = 'for Week Ending ' + this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') + ' (' + this.dataSource.data.length + ' Records)';
        }
        this.spinner.hide();
      },
        (error => {
          this.spinner.hide();
          this.alertService.error(error);
        })
      );
  }
  exportToExcel(event) {
    this.exportService.exportExcelWithFormat(this.dataSource.data, 'HeadCountreport-' + this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'), this.reportColumns());
    event.preventDefault();
  }
  reportColumns(): any[] {
    const leftColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'left' } };
    const centerColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'center' } };
    const rightColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'right' } };
    return [
      { header: "Office", key: "office", width: 10, style: leftColumnStyle },
      { header: "Contractor", key: "contractor", width: 30, style: centerColumnStyle },
      { header: "Client", key: "client", width: 30, style: centerColumnStyle },
      { header: "Position", key: "position", width: 30, style: centerColumnStyle },
      { header: "Hours", key: "hours", width: 8, style: rightColumnStyle },
      { header: "OT Hours", key: "otHours", width: 8, style: rightColumnStyle },
      { header: "DT Hours", key: "dtHours", width: 8, style: rightColumnStyle },
      { header: "Pay Rate", key: "payRate", width: 8, style: rightColumnStyle },
      { header: "OT Rate", key: "otRate", width: 8, style: centerColumnStyle },
      { header: "DT Rate", key: "dtRate", width: 8, style: centerColumnStyle },
      { header: "Pay", key: "pay", width: 10, style: rightColumnStyle },
      { header: "Burden", key: "burden", width: 10, style: rightColumnStyle },
      { header: "PPExp", key: "ppExp", width: 8, style: rightColumnStyle },
      { header: "OOPExp", key: "oopExp", width: 8, style: rightColumnStyle },
      { header: "ExpAll", key: "expAllowance", width: 8, style: centerColumnStyle },
      { header: "Reimb OOP", key: "reimbOOP", width: 8, style: centerColumnStyle },
      { header: "ExpCost", key: "expCost", width: 8, style: rightColumnStyle },
      { header: "Ref Fee", key: "refFee", width: 8, style: rightColumnStyle },
      { header: "Cost", key: "cost", width: 15, style: rightColumnStyle },
      { header: "Bill Rate", key: "billRate", width: 8, style: rightColumnStyle },
      { header: "OT Bill Rate", key: "otBillRate", width: 8, style: centerColumnStyle },
      { header: "DT Bill Rate", key: "dtBillRate", width: 8, style: centerColumnStyle },
      { header: "Invoice", key: "invoice", width: 15, style: rightColumnStyle },
      { header: "Margin", key: "margin", width: 15, style: rightColumnStyle },
      { header: "GP %", key: "gp", width: 8, style: rightColumnStyle },
      { header: "Sales Person", key: "salesPerson", width: 30, style: rightColumnStyle },
      { header: "Recruiter", key: "recruiter", width: 30, style: rightColumnStyle }];
  }
}
