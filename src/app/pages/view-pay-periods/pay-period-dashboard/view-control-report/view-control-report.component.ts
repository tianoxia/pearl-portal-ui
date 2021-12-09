import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService, ExportService } from 'app/_services';
import { ControlReportResponse, ControlReportRequest,
  Department, Recruiter, Client, CustomReportTotals } from 'app/_models';

@Component({
  selector: 'app-view-control-report',
  templateUrl: './view-control-report.component.html',
  styleUrls: ['./view-control-report.component.css']
})
export class ViewControlReportComponent implements OnInit {
  @ViewChild('selectclients', { static: true }) selectClients: MatSelect;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() controlReportForm: FormGroup;
  @Input() departments: Department[];
  @Input() clients: Client[];
  @Input() recruiters: Recruiter[];
  subTitle: string;
  startDate: Date;
  sum: CustomReportTotals;
  weekEnding: Date;
  payFrequency: string;
  selectedDept: Department;
  floatLabelControl = new FormControl('auto');
  allSelected = true;
  defaultDept: Department = {
    departmentId: 0,
    name: 'All',
    departmentNumber: '0'
  };
  defaultClient: Client;
  defaultRecruiter: Recruiter;
  public displayedColumns = ['office', 'contractor', 'client', 'position',
          'hours', 'otHours', 'dtHours', 'payRate', 'otRate',
          'dtRate', 'pay', 'burden', 'ppExp', 'oopExp', 'expAllowance', 'reimbOOP',
          'expCost', 'refFee', 'cost', 'billRate', 'otBillRate', 'dtBillRate',
          'invoice', 'margin', 'gp', 'salesPerson', 'recruiter'];
  public dataSource = new MatTableDataSource<ControlReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder, private route: ActivatedRoute,
    private dataService: DataService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private spinner: NgxSpinnerService) {
      this.defaultClient = new Client();
      this.defaultClient.clientId = 0;
      this.defaultClient.name = 'All';
      this.defaultRecruiter = new Recruiter();
      this.defaultRecruiter.firstName = 'All';
      this.defaultRecruiter.lastName = '';
      this.defaultRecruiter.employeeId = 0;
      this.controlReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        department: this.defaultDept,
        recruiter: this.defaultRecruiter,
        client: this.defaultClient
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
    const request: ControlReportRequest = {
      departmentId: 0,
      employeeId: 0,
      clientId: 0,
      weekEnding: this.weekEnding,
      payFrequency: this.payFrequency
    };
    forkJoin([this.dataService.getAllDepartments(),
    this.dataService.getAllRecruiters(), this.dataService.getAllClients(),
    this.dataService.getControlReport(request)])
      .subscribe(([departments, recruiters, clients, controlReports]) => {
        this.departments = departments as Department[];
        this.recruiters = recruiters as Recruiter[];
        this.clients = clients as Client[];
        this.dataSource.data = controlReports as ControlReportResponse[];
        this.dataSource.sort = this.sort;
        this.departments.splice(0, 0, this.defaultDept);
        this.controlReportForm.get('department').patchValue(this.defaultDept);
        this.clients.splice(0, 0, this.defaultClient);
        this.recruiters.splice(0, 0, this.defaultRecruiter);
        this.controlReportForm.get('recruiter').patchValue(this.defaultRecruiter); 
        this.controlReportForm.get('client').patchValue(this.defaultClient);
        if (this.dataSource)
          for (let row of this.dataSource.data) {
            if (row.hours !== 0) this.sum.totalHours += row.hours;
            if (row.otHours !== 0) this.sum.totalOTHours += row.otHours;
            if (row.dtHours !== 0) this.sum.totalDTHours += row.dtHours;
            if (row.pay !== 0) this.sum.totalPay += row.pay;
            if (row.burden !== 0) this.sum.totalBurden += row.burden;
            if (row.ppExp !== 0) this.sum.totalPPExp += row.ppExp;
            if (row.oopExp !== 0) this.sum.totalOOPExp += row.oopExp;
            if (row.expAllowance !== 0) this.sum.totalExpAllowance += row.expAllowance;
            if (row.reimbOOP !== 0) this.sum.totalReimbOOP += row.reimbOOP;
            if (row.expCost !== 0) this.sum.totalExpCost += row.expCost;
            if (row.refFee !== 0)  this.sum.totalRefFee += row.refFee;
            if (row.cost !== 0) this.sum.totalCost += row.cost;
            if (row.invoice !== 0) this.sum.totalInvoice += row.invoice;
            if (row.margin !== 0) this.sum.totalMargin += row.margin;
          }
        this.sum.totalGP = this.sum.totalInvoice > 0 ? (this.sum.totalMargin / this.sum.totalInvoice) * 100 : 0;
        this.subTitle = 'for Pay Period Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.dataSource.data.length+' Records)';
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
  compareClients(o1: any, o2: any) {
    return (o1.name == o2.name && o1.clientId == o2.clientId);
  }
  public showReport = (controlReportFormValue) => {
    if (this.controlReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(controlReportFormValue);
    }
  }

  private executeGetReport = (controlReportFormValue) => {
    this.sum = new CustomReportTotals();
    const request: ControlReportRequest = {
      departmentId: controlReportFormValue.department.departmentId,
      employeeId: controlReportFormValue.recruiter.employeeId,
      clientId: controlReportFormValue.client.clientId,
      weekEnding: this.weekEnding,
      payFrequency: this.payFrequency
    };
    this.dataService.getControlReport(request)
      .subscribe((res: ControlReportResponse[]) => {
        window.scrollTo(0, 0);
        this.dataSource.data = res as ControlReportResponse[];
        this.dataSource.sort = this.sort;
        if (this.dataSource)
          for (let row of this.dataSource.data) {
            if (row.hours !== 0) this.sum.totalHours += row.hours;
            if (row.otHours !== 0) this.sum.totalOTHours += row.otHours;
            if (row.dtHours !== 0) this.sum.totalDTHours += row.dtHours;
            if (row.pay !== 0) this.sum.totalPay += row.pay;
            if (row.burden !== 0) this.sum.totalBurden += row.burden;
            if (row.ppExp !== 0) this.sum.totalPPExp += row.ppExp;
            if (row.oopExp !== 0) this.sum.totalOOPExp += row.oopExp;
            if (row.expAllowance !== 0) this.sum.totalExpAllowance += row.expAllowance;
            if (row.reimbOOP !== 0) this.sum.totalReimbOOP += row.reimbOOP;
            if (row.expCost !== 0) this.sum.totalExpCost += row.expCost;
            if (row.refFee !== 0)  this.sum.totalRefFee += row.refFee;
            if (row.cost !== 0) this.sum.totalCost += row.cost;
            if (row.invoice !== 0) this.sum.totalInvoice += row.invoice;
            if (row.margin !== 0) this.sum.totalMargin += row.margin;
          }
          this.sum.totalGP = this.sum.totalInvoice > 0 ? (this.sum.totalMargin / this.sum.totalInvoice) * 100 : 0;
          this.subTitle = 'for Pay Period Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.dataSource.data.length+' Records)';
          this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  exportToExcel(event) {
    this.exportService.exportExcelWithFormat(this.dataSource.data, 'controlreport-' + this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'), this.reportColumns());
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
