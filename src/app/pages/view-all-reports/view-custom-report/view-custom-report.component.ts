import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core'; 
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService, ExportService } from 'app/_services';
import { CustomReportResponse, CustomReportRequest,
  Department, Recruiter, Client, CustomReportTotals } from 'app/_models';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-view-custom-report',
  templateUrl: './view-custom-report.component.html',
  styleUrls: ['./view-custom-report.component.css']
})
export class ViewCustomReportComponent implements OnInit {
  @ViewChild('selectclients', { static: true }) selectClients: MatSelect;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() customReportForm: FormGroup;
  @Input() departments: Department[];
  @Input() clients: Client[];
  @Input() recruiters: Recruiter[];
  startDate: Date;
  sum: CustomReportTotals;
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
          'weekEnding', 'hours', 'otHours', 'dtHours', 'payRate', 'otRate',
          'dtRate', 'pay', 'burden', 'ppExp', 'oopExp', 'expAllowance', 'reimbOOP',
          'expCost', 'refFee', 'cost', 'billRate', 'otBillRate', 'dtBillRate',
          'invoice', 'margin', 'gp', 'salesPerson', 'recruiter'];
  public dataSource = new MatTableDataSource<CustomReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder,
    private dataService: DataService,
    private exportService: ExportService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private spinner: NgxSpinnerService) {
      this.defaultClient = new Client();
      this.defaultClient.clientId = 0;
      this.defaultClient.name = 'All';
      this.defaultRecruiter = new Recruiter();
      this.defaultRecruiter.firstName = 'All';
      this.defaultRecruiter.lastName = '';
      this.defaultRecruiter.employeeId = 0;
      this.customReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        fromdate: new FormControl(new Date(new Date().getFullYear(), new Date().getMonth(), 1), [Validators.required]),
        todate: new FormControl(new Date(), [Validators.required]),
        department: this.defaultDept,
        recruiter: this.defaultRecruiter,
        clients: new FormControl(new Client()[''], [Validators.required])
      });
      this.sum = new CustomReportTotals();
    }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.loadData();
  }

  private loadData() {
    forkJoin([this.dataService.getAllDepartments(),
    this.dataService.getAllRecruiters(), this.dataService.getAllClients()])
      .subscribe(([departments, recruiters, clients]) => {
        this.departments = departments as Department[];
        this.recruiters = recruiters as Recruiter[];
        this.clients = clients as Client[];
        
        this.departments.splice(0, 0, this.defaultDept);
        this.customReportForm.get('department').patchValue(this.defaultDept);
        //this.clients.splice(0, 0, this.defaultClient);
        this.recruiters.splice(0, 0, this.defaultRecruiter);
        this.customReportForm.get('recruiter').patchValue(this.defaultRecruiter);
        this.selectClients.options.forEach((item: MatOption) => item.select());   
        this.customReportForm.get('clients').patchValue(clients);
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
  toggleAllSelection() {
    if (this.allSelected) {
      this.selectClients.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectClients.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.selectClients.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }
  public showReport = (customReportFormValue) => {
    if (this.customReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(customReportFormValue);
    }
  }

  private executeGetReport = (customReportFormValue) => {
    let clientIds = [];
    this.sum = new CustomReportTotals();
    if (this.selectClients.options.first.selected) {
        clientIds.push(0);
    } else {
      customReportFormValue.clients.forEach((item: Client) => {
        clientIds.push(item.clientId);
      });
    }
    const request: CustomReportRequest = {
      fromDate: customReportFormValue.fromdate,
      toDate: customReportFormValue.todate,
      departmentId: customReportFormValue.department.departmentId,
      employeeId: customReportFormValue.recruiter.employeeId,
      clientIds: clientIds
    };
    this.dataService.getCustomReport(request)
      .subscribe((res: CustomReportResponse[]) => {
        window.scrollTo(0, 0);
        this.dataSource.data = res as CustomReportResponse[];
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
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  exportToExcel(event) {
    this.exportService.exportExcelWithFormat(this.customReportPrint(), 'customreport', this.reportColumns());
    event.preventDefault();
  }
  reportColumns(): any[] {
    const leftColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'left' } };
    const centerColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'center' } };
    const rightColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'right' } };
    return [
      { header: 'Office', key: 'office', width: 10, style: leftColumnStyle },
      { header: 'Contractor', key: 'contractor', width: 30, style: centerColumnStyle },
      { header: 'Client', key: 'client', width: 30, style: centerColumnStyle },
      { header: 'Position', key: 'position', width: 30, style: centerColumnStyle },
      { header: 'Week Ending', key: 'weekEnding', width: 12, style: centerColumnStyle },
      { header: 'Hours', key: 'hours', width: 8, style: rightColumnStyle },
      { header: 'OT Hours', key: 'otHours', width: 8, style: rightColumnStyle },
      { header: 'DT Hours', key: 'dtHours', width: 8, style: rightColumnStyle },
      { header: 'Pay Rate', key: 'payRate', width: 8, style: rightColumnStyle },
      { header: 'OT Rate', key: 'otRate', width: 8, style: rightColumnStyle },
      { header: 'DT Rate', key: 'dtRate', width: 8, style: rightColumnStyle },
      { header: 'Pay', key: 'pay', width: 10, style: rightColumnStyle },
      { header: 'Burden', key: 'burden', width: 10, style: rightColumnStyle },
      { header: 'PPExp', key: 'ppExp', width: 8, style: rightColumnStyle },
      { header: 'OOPExp', key: 'oopExp', width: 8, style: rightColumnStyle },
      { header: 'ExpAll', key: 'expAllowance', width: 8, style: rightColumnStyle },
      { header: 'Reimb OOP', key: 'reimbOOP', width: 8, style: rightColumnStyle },
      { header: 'ExpCost', key: 'expCost', width: 8, style: rightColumnStyle },
      { header: 'Ref Fee', key: 'refFee', width: 8, style: rightColumnStyle },
      { header: 'Cost', key: 'cost', width: 15, style: rightColumnStyle },
      { header: 'Bill Rate', key: 'billRate', width: 8, style: rightColumnStyle },
      { header: 'OT Bill Rate', key: 'otBillRate', width: 8, style: rightColumnStyle },
      { header: 'DT Bill Rate', key: 'dtBillRate', width: 8, style: rightColumnStyle },
      { header: 'Invoice', key: 'invoice', width: 15, style: rightColumnStyle },
      { header: 'Margin', key: 'margin', width: 15, style: rightColumnStyle },
      { header: 'GP %', key: 'gp', width: 8, style: rightColumnStyle },
      { header: 'Sales Person', key: 'salesPerson', width: 20, style: rightColumnStyle },
      { header: 'Recruiter', key: 'recruiter', width: 20, style: rightColumnStyle }];
  }
  customReportPrint() {
    let data = [];
    this.dataSource.data.forEach(item => {
      data.push({
        'office': item.office,
        'contractor': item.contractor,
        'client': item.client,
        'position': item.position,
        'weekEnding': this.datePipe.transform(item.weekEnding, 'MM/dd/yyyy'),
        'hours': this.decimalPipe.transform(item.hours, '1.2-2'),
        'otHours': this.decimalPipe.transform(item.otHours, '1.2-2'),
        'dtHours': this.decimalPipe.transform(item.dtHours, '1.2-2'),
        'payRate': this.currencyPipe.transform(item.payRate),
        'otRate': this.currencyPipe.transform(item.otRate),
        'dtRate': this.currencyPipe.transform(item.dtRate),
        'pay': this.currencyPipe.transform(item.pay),
        'burden': this.currencyPipe.transform(item.burden),
        'ppExp': this.currencyPipe.transform(item.ppExp),
        'oopExp': this.currencyPipe.transform(item.oopExp),
        'expAllowance': this.currencyPipe.transform(item.expAllowance),
        'reimbOOP': this.currencyPipe.transform(item.reimbOOP),
        'expCost': this.currencyPipe.transform(item.expCost),
        'refFee': this.currencyPipe.transform(item.refFee),
        'cost': this.currencyPipe.transform(item.cost),
        'billRate': this.currencyPipe.transform(item.billRate),
        'otBillRate': this.currencyPipe.transform(item.otBillRate),
        'dtBillRate': this.currencyPipe.transform(item.dtBillRate),
        'invoice': this.currencyPipe.transform(item.invoice),
        'margin': this.currencyPipe.transform(item.margin),
        'gp': this.decimalPipe.transform(item.gp, '1.2-2'),
        'salesPerson': item.salesPerson,
        'recruiter': item.recruiter
      })
    });
    return data;
  }
}
