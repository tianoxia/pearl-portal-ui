import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AlertService, AuthenticationService, PayrollReportService } from 'app/_services';
import {
  PayrollReportResponse, PayrollReportRequest, Resource, PermissionType, PayrollSubTotal, InvoiceReportRequest, PayrollType, InvoiceDetail
} from 'app/_models';
import { employeeStatus } from 'app/constants/employee-status';
import { employeeCategory } from 'app/constants/employee-category';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-view-payroll-report',
  templateUrl: './view-payroll-report.component.html',
  styleUrls: ['./view-payroll-report.component.css']
})
export class ViewPayrollReportComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() payrollReportForm: FormGroup;
  subTitle: string;
  sumInvoiceDetailDiscount: number;
  sumInvoiceDetailTotal: number;
  payrollReportData: PayrollReportResponse;
  public invoiceDetails = new MatTableDataSource<InvoiceDetail>();
  statuses = employeeStatus;
  categories = employeeCategory;
  payrollType = PayrollType;
  payDate: Date;
  initialLoad: boolean | false;
  weekEnding1: Date;
  weekEnding2: Date;
  payPeriodId: number;
  payFrequency: string;
  public displayedColumns = ['firstName', 'client', 'weekOneHours', 'weekOneOTHours', 'weekOneDTHours', 'weekTwoHours',
    'weekTwoOTHours', 'weekTwoDTHours', 'totalHours', 'totalOTHours', 'totalDTHours', 'payRate',
    'otRate', 'dtRate', 'totalPay', 'totalSalary', 'totalCommission', 'totalExpenses', 'payMethod'];
  public displayedInvoiceDetailColumns = ['invoiceNumber', 'discount', 'amount', 'clientName'];
  public dataSource = new MatTableDataSource<PayrollSubTotal>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private payrollService: PayrollReportService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService) {
    this.payrollReportForm = fb.group({
      employeeStatus: 'Active',
      employeeCategory: 'Recruiter'
    });
  }

  ngOnInit() {
    this.initialLoad = true;
    if (this.authService.currentUserValue !== null) {
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.Payroll && e.permissionTypes.includes(PermissionType.VIEW))) {
        this.router.navigateByUrl("/unauthorized");
      }
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.payDate = new Date(params.get('paydate'));
      this.weekEnding1 = new Date(params.get('weekending'));
      this.weekEnding2 = params.get('altweekending') ? new Date(params.get('altweekending')) : null;
      this.payFrequency = params.get('payfrequency');
      this.payPeriodId = +params.get('payperiodid');
      this.executeGetReport('Active', 'Recruiter');
    });
  }
  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }

  compareCategory(o1: any, o2: any) {
    return (o1 == o2);
  }
  buildInvoiceRequest(): InvoiceReportRequest {
    const request: InvoiceReportRequest = {
      weekEnding1: this.datePipe.transform(this.weekEnding1, 'yyyy-MM-dd'),
      payPeriodId: this.payPeriodId,
      payFrequency: this.payFrequency,
      payDate: this.datePipe.transform(this.payDate, 'yyyy-MM-dd'),
      weekEnding2: this.weekEnding2 ? this.datePipe.transform(this.weekEnding2, 'yyyy-MM-dd')
        : this.datePipe.transform(new Date('0001-01-01T00:00:00Z'), 'yyyy-MM-dd'),
      isRequestFromInvoicesReport: false
    };
    return request;
  }
  public showReport = (payrollReportFormValue) => {
    if (this.payrollReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(payrollReportFormValue.employeeStatus, payrollReportFormValue.employeeCategory);
    }
  }

  private executeGetReport(status: string, category: string) {
    const request: PayrollReportRequest = {
      employeeStatus: status,
      category: category,
      weekEnding1: this.weekEnding1,
      payFrequency: this.payFrequency,
      payDate: this.payDate,
      weekEnding2: this.weekEnding2 ? this.weekEnding2
      : new Date('0001-01-01T00:00:00Z')
    };
    const observables = [];
    observables.push(this.payrollService.getPayrollReport(request));
    observables.push(this.payrollService.getInvoiceDetails(this.payPeriodId));
    if (this.initialLoad) {
      observables.push(this.payrollService.calculateInvoices(this.buildInvoiceRequest()));
      this.initialLoad = false;
    }

    forkJoin(observables)
      .subscribe((data: any) => {
        window.scrollTo(0, 0);
        this.payrollReportData = data[0] as PayrollReportResponse;
        this.invoiceDetails.data = data[1] as InvoiceDetail[];
        this.dataSource.data = this.payrollReportData.payrollSubTotals;
        this.sumInvoiceDetailDiscount = this.invoiceDetails.data.map(a => a.discount).reduce(function (a, b) {
          return a + b;
        });
        this.sumInvoiceDetailTotal = this.invoiceDetails.data.map(a => a.amount).reduce(function (a, b) {
          return a + b;
        });
        this.subTitle = 'for Pay Date ' + this.datePipe.transform(this.payDate, 'MM/dd/yyyy');
        this.spinner.hide();
      },
        (error => {
          this.spinner.hide();
          this.alertService.error(error);
        })
      );
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
  }
}
