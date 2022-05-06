import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService, ExportService } from 'app/_services';
import {
  GrossProfitReportResponse, GrossProfitReportRequest, CustomReportTotals
} from 'app/_models';

@Component({
  selector: 'app-view-gross-profit-report',
  templateUrl: './view-gross-profit-report.component.html',
  styleUrls: ['./view-gross-profit-report.component.css']
})
export class ViewGrossProfitReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() grossProfitReportForm: FormGroup;
  subTitle: string;
  fromDate: Date;
  toDate: Date;
  sum: CustomReportTotals;
  weekEnding: Date;
  floatLabelControl = new FormControl('auto');
  public displayedColumns = ['candidateSourceName', 'grossMargin'];
  public dataSource = new MatTableDataSource<GrossProfitReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private dataService: DataService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private spinner: NgxSpinnerService) {
    this.grossProfitReportForm = fb.group({
      floatLabel: this.floatLabelControl,
      fromDate: '',
      toDate: ''
    });
    this.sum = new CustomReportTotals();
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.weekEnding = new Date(params.get('weekending'));
      this.fromDate = new Date(params.get('weekending'));
      this.fromDate.setDate(this.fromDate.getDate() - 6);
      this.toDate = this.weekEnding;
      this.loadData();
    });
  }

  private loadData() {
    const request: GrossProfitReportRequest = {
      fromDate: this.fromDate,
      toDate: this.toDate
    };
    forkJoin([this.dataService.getGrossProfitReport(request)])
      .subscribe((grossProfitReports) => {
        this.dataSource.data = grossProfitReports[0] as GrossProfitReportResponse[];
        this.dataSource.sort = this.sort;
        if (this.dataSource.data.length > 0) {
          for (let row of this.dataSource.data) {
            if (row.grossMargin !== 0) this.sum.totalMargin += row.grossMargin;
          }
          this.subTitle = 'for Pay Period Ending ' + this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') + ' (' + this.dataSource.data.length + ' Records)';
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
  public showReport = (grossProfitReportFormValue) => {
    if (this.grossProfitReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(grossProfitReportFormValue);
    }
  }

  private executeGetReport = (grossProfitReportFormValue) => {
    this.sum = new CustomReportTotals();
    const request: GrossProfitReportRequest = {
      fromDate: grossProfitReportFormValue.fromDate,
      toDate: grossProfitReportFormValue.toDate
    };
    this.dataService.getGrossProfitReport(request)
      .subscribe((res: GrossProfitReportResponse[]) => {
        window.scrollTo(0, 0);
        this.dataSource.data = res;
        this.dataSource.sort = this.sort;
        if (this.dataSource.data.length > 0) {
          for (let row of this.dataSource.data) {
            if (row.grossMargin !== 0) this.sum.totalMargin += row.grossMargin;
          }
        } else {
          this.alertService.error('No Record Found');
        }
        if (this.fromDate) {
          this.subTitle = 'for date between ' + this.datePipe.transform(this.fromDate, 'MM/dd/yyyy') +
          ' - ' + this.datePipe.transform(this.toDate, 'MM/dd/yyyy') + ' (' + this.dataSource.data.length + ' Records)';
        } else {
          this.subTitle = 'for Week Ending ' + this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') +
          ' (' + this.dataSource.data.length + ' Records)';
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
    this.exportService.exportExcelWithFormat(this.dataSource.data, 'grossProfitreport-' +
    this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'), this.reportColumns());
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
