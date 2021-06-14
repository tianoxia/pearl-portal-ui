import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core'; 
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService } from 'app/_services';
import { CustomReportResponse, CustomReportRequest,
  Department, Recruiter, Client, CustomReportTotals } from 'app/_models';

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
}
