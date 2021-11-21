import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService } from 'app/_services';
import { SummaryReportResponse, SummaryReportRequest, Department, MonthlySummary } from 'app/_models';

@Component({
  selector: 'app-view-summary-report',
  templateUrl: './view-summary-report.component.html',
  styleUrls: ['./view-summary-report.component.css']
})
export class ViewSummaryReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  //@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() summaryReportForm: FormGroup;
  @Input() departments: Department[];
  startDate: Date;
  defaultDept: Department = {
    departmentId: 0,
    name: 'All',
    departmentNumber: '0'
  };
  floatLabelControl = new FormControl('auto');

  public displayedColumns = ['weekEnding', 'contractorCount', 'totalHours', 'billRate',
          'payRate', 'hourlyMargin', 'totalCost', 'totalDiscount', 'totalInvoice', 'grossMargin',
          'contractBurden', 'netMargin'];
  public displayedColumns2 = ['weekEnding1', 'totalHours1', 'totalCost1', 'totalDiscount1', 'totalInvoice1', 'grossMargin1',
          'contractBurden1', 'netMargin1'];
  public displayedColumns3 = ['weekEnding2', 'totalHours2', 'netMargin2'];
  public dataSource = new MatTableDataSource<MonthlySummary>();
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
        department: this.defaultDept
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
        
        this.departments.splice(0, 0, this.defaultDept);
        this.summaryReportForm.get('department').patchValue(this.defaultDept);
        const report = summaryReports as SummaryReportResponse;
        this.dataSource.data = report.monthlySummary;
        this.dataSource.sort = this.sort;
        
        //this.dataSource.paginator = this.paginator;
        this.spinner.hide();
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
      department: summaryReportFormValue.department
    };
    this.dataService.getSummaryReport(request)
      .subscribe((res: SummaryReportResponse) => {
        window.scrollTo(0, 0);
        this.dataSource.data = res.monthlySummary;
        this.dataSource.sort = this.sort;
        //this.dataSource.paginator = this.paginator;
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
}
