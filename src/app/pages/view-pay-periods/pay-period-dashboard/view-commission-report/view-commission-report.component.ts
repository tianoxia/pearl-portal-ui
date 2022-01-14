import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService, ExportService } from 'app/_services';
import { CommissionReportResponse, CommissionReportRequest,
  Department, Recruiter, Client, CustomReportTotals } from 'app/_models';
import { employeeStatus } from 'app/constants/employee-status';

@Component({
  selector: 'app-view-commission-report',
  templateUrl: './view-commission-report.component.html',
  styleUrls: ['./view-commission-report.component.css']
})
export class ViewCommissionReportComponent implements OnInit {
  @ViewChild('selectclients', { static: true }) selectClients: MatSelect;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() commissionReportForm: FormGroup;
  @Input() departments: Department[];
  @Input() recruiters: Recruiter[];
  commissionReport: CommissionReportResponse;
  subTitle: string;
  startDate: Date;
  sum: CustomReportTotals;
  weekEnding: Date;
  statuses = employeeStatus;
  selectedDept: Department;
  selectedEmployee: Recruiter;
  floatLabelControl = new FormControl('auto');
  defaultDept: Department = {
    departmentId: 0,
    name: 'All',
    departmentNumber: '0'
  };
  defaultClient: Client;
  defaultRecruiter: Recruiter;
  public displayedColumns: string[];
  public columns = ['employeeName', 'monthlyGrossMargin', 'recruitRate', 'mtdRecruitCommission'];
  /* public dataSource = new MatTableDataSource<CommissionReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  } */
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private dataService: DataService,
    private datePipe: DatePipe,
    private router: Router,
    private exportService: ExportService,
    private spinner: NgxSpinnerService) {
      this.defaultClient = new Client();
      this.defaultClient.clientId = 0;
      this.defaultClient.name = 'All';
      this.defaultRecruiter = new Recruiter();
      this.defaultRecruiter.firstName = 'All';
      this.defaultRecruiter.lastName = '';
      this.defaultRecruiter.employeeId = 0;
      this.commissionReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        department: this.defaultDept,
        recruiter: this.defaultRecruiter,
        employeeStatus: 'Active'
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
    const request: CommissionReportRequest = {
      departmentId: 0,
      employeeId: 0,
      weekEnding: this.weekEnding,
      employeeStatus: 'Active'
    };
    forkJoin([this.dataService.getAllDepartments(),
    this.dataService.getAllRecruiters(), this.dataService.getCommissionReport(request)])
      .subscribe(([departments, recruiters, commissionReport]) => {
        this.departments = departments as Department[];
        this.recruiters = recruiters as Recruiter[];
        this.commissionReport = commissionReport as CommissionReportResponse;
        //this.dataSource.sort = this.sort;
        this.departments.splice(0, 0, this.defaultDept);
        this.commissionReportForm.get('department').patchValue(this.defaultDept);
        this.recruiters.splice(0, 0, this.defaultRecruiter);
        this.displayedColumns.push('Employee');
        for (let wk of this.commissionReport.weelyCommissionTotal) {
          this.displayedColumns.push(this.datePipe.transform(wk.weekEnding, 'MM/dd/yyyy'));
        }
        this.displayedColumns.push('MonthlyGrossMargin', 'RecruitRate', 'MTDRecruitCommission');
        this.commissionReportForm.get('recruiter').patchValue(this.defaultRecruiter); 
        
        this.subTitle = 'for Pay Period Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.commissionReport.employeeCommissionReportDetails.length+' Records)';
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
  compareRecruiters(o1: any, o2: any) {
    return (o1.firstName == o2.firstName && o1.lastName == o2.lastName && o1.employeeId == o2.employeeId);
  }
  compareEmployeeTypes(o1: any, o2: any) {
    return (o1 == o2);
  }
  public showReport = (commissionReportFormValue) => {
    if (this.commissionReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(commissionReportFormValue);
    }
  }
  selectEmployee(event: MatSelectChange) {
    this.selectedEmployee = event.value;
    this.router.navigate(['view-pay-periods/pay-period-dashboard/view-commission-detail-report'], {queryParams: { weekending: this.weekEnding,
      employeestatus: this.commissionReportForm.controls.employeeStatus.value, employeeid: this.selectedEmployee.employeeId }});          
  }
  private executeGetReport = (commissionReportFormValue) => {
    this.displayedColumns = [];
    const request: CommissionReportRequest = {
      departmentId: commissionReportFormValue.department.departmentId,
      employeeId: commissionReportFormValue.recruiter.employeeId,
      weekEnding: this.weekEnding,
      employeeStatus: commissionReportFormValue.employeeStatus
    };
    this.dataService.getCommissionReport(request)
      .subscribe((res: CommissionReportResponse) => {
        window.scrollTo(0, 0);
        this.commissionReport = res as CommissionReportResponse;
        this.displayedColumns.push('Employee');
        for (let wk of this.commissionReport.weelyCommissionTotal) {
          this.displayedColumns.push(this.datePipe.transform(wk.weekEnding, 'MM/dd/yyyy'));
        }
        this.displayedColumns.push('MonthlyGrossMargin', 'RecruitRate', 'MTDRecruitCommission');
        //this.dataSource.sort = this.sort;
        this.subTitle = 'for Pay Period Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.commissionReport.employeeCommissionReportDetails.length+' Records)';
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
