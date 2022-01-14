import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService, ExportService } from 'app/_services';
import { CommissionReportData, CommissionReportRequest, Recruiter, CustomReportTotals, WeeklyCommissionReport } from 'app/_models';

@Component({
  selector: 'app-view-commission-detail-report',
  templateUrl: './view-commission-detail-report.component.html',
  styleUrls: ['./view-commission-detail-report.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ViewCommissionDetailReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() commissionDetailForm: FormGroup;
  @Input() recruiters: Recruiter[];
  startDate: Date;
  sum: CustomReportTotals;
  weekEnding: Date;
  floatLabelControl = new FormControl('auto');
  employeeId: number;
  employeeStatus: string;
  public displayedColumns: string[] = ['assignment', 'recruitGrossMargin', 'salesGrossMargin',
  'recruitRate', 'salesRate', 'recruitCommission', 'salesCommission', 'totalCommission'];
  public dataSource = new MatTableDataSource<WeeklyCommissionReport>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private dataService: DataService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private spinner: NgxSpinnerService) {
      this.commissionDetailForm = fb.group({
        floatLabel: this.floatLabelControl,
        recruiter: ''
      });
    }

  ngOnInit() {
    window.scrollTo(0, 0);    
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.weekEnding = new Date(params.get('weekending'));
      this.employeeStatus = params.get('employeestatus');
      this.employeeId = +params.get('employeeid');
      this.loadData();
    });
  }
  private loadData() {
    const request: CommissionReportRequest = {
      departmentId: 0,
      employeeId: this.employeeId,
      weekEnding: this.weekEnding,
      employeeStatus: this.employeeStatus
    };
    forkJoin([this.dataService.getAllRecruiters(), this.dataService.getCommissionDetailReport(request)])
      .subscribe(([recruiters, commissionReport]) => {
        this.recruiters = recruiters as Recruiter[];
        if (commissionReport) {
          this.dataSource.data = (commissionReport as CommissionReportData).weeklyCommissionReports as WeeklyCommissionReport[];
          this.dataSource.sort = this.sort;
        }
        this.commissionDetailForm.get('recruiter').patchValue(this.recruiters.find(r => r.employeeId === this.employeeId)); 
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
  selectEmployee(event: MatSelectChange) {
    this.spinner.show();
    this.executeGetReport(event.value.employeeId);
  }
  private executeGetReport = (employeeId: number) => {
    const request: CommissionReportRequest = {
      departmentId: 0,
      employeeId: employeeId,
      weekEnding: this.weekEnding,
      employeeStatus: this.employeeStatus
    };
    this.dataService.getCommissionDetailReport(request)
      .subscribe((res: CommissionReportData) => {
        window.scrollTo(0, 0);
        if (res) {
          this.dataSource.data = (res as CommissionReportData).weeklyCommissionReports as WeeklyCommissionReport[];
          this.dataSource.sort = this.sort;
        }
        
        this.dataSource.sort = this.sort;
        this.spinner.hide();
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
  exportToExcel(event) {
    //this.exportService.exportExcelWithFormat(this.dataSource.data, 'controlreport-' + this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'), this.reportColumns());
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
