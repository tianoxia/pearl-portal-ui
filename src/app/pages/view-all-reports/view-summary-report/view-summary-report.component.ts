import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService } from 'app/_services';
import { SummaryReportResponse, SummaryReportRequest, Department } from 'app/_models';

@Component({
  selector: 'app-view-summary-report',
  templateUrl: './view-summary-report.component.html',
  styleUrls: ['./view-summary-report.component.css']
})
export class ViewSummaryReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() summaryReportForm: FormGroup;
  @Input() departments: Department[];
  startDate: Date;
  floatLabelControl = new FormControl('auto');

  public displayedColumns = ['weekEnding', 'contractorCount', 'totalHours', 'billRate',
          'payRate', 'hourlyMargin', 'totalCost', 'totalDiscount', 'totalInvoice',
          'burden', 'totalMargin'];
  public dataSource = new MatTableDataSource<SummaryReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder,
    private dataService: DataService,
    private spinner: NgxSpinnerService) {
      this.summaryReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        fromdate: new FormControl(new Date(new Date().getFullYear(), 0, 1), [Validators.required]),
        todate: new FormControl(new Date(), [Validators.required]),
        department: new FormControl('')
      });
    }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.loadData();
  }

  private loadData() {
    const request: SummaryReportRequest = {
      fromDate: new Date(new Date().getFullYear(), 0, 1),
      toDate: new Date(),
      department: null
    };
    forkJoin([this.dataService.getAllDepartments(),
    this.dataService.getSummaryReport(request)])
      .subscribe(([departments, summaryReports]) => {
        this.departments = departments as Department[];
        this.dataSource.data = summaryReports as SummaryReportResponse[];
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  public showReport = (summaryReportFormValue) => {
    if (this.summaryReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(summaryReportFormValue);
    }
  }

  private executeGetReport = (summaryReportFormValue) => {
    const request: SummaryReportRequest = {
      fromDate: summaryReportFormValue.fromdate,
      toDate: summaryReportFormValue.todate,
      department: null
    };
    this.dataService.getSummaryReport(request)
      .subscribe((res: SummaryReportResponse[]) => {
        window.scrollTo(0, 0);
        this.dataSource.data = res as SummaryReportResponse[];
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
}
