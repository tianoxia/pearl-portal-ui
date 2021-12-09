import { Component, OnInit, Input, ViewChild, PipeTransform } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AlertService, DataService } from 'app/_services';
import { PLReportRequest, PLReportResponse } from 'app/_models';

@Component({
  selector: 'app-view-team-pl-report',
  templateUrl: './view-team-pl-report.component.html',
  styleUrls: ['./view-team-pl-report.component.css']
})
export class ViewTeamPlReportComponent implements OnInit {
  @Input() plReportForm: FormGroup;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  myData: any[];
  public dataSource = new MatTableDataSource<PLReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  public displayedColumns = ['salesPersonName'];
  constructor(public alertService: AlertService,
    fb: FormBuilder,
    private dataService: DataService,
    private spinner: NgxSpinnerService) {
      this.plReportForm = fb.group({
        fromdate: new FormControl(new Date(new Date().getFullYear(), 0, 1), [Validators.required]),
        todate: new FormControl(new Date(), [Validators.required]),
      });
    }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.loadData();
  }

  private loadData() {
    const request: PLReportRequest = {
      fromDate: new Date(new Date().getFullYear(), 0, 1),
      toDate: new Date()
    };
    forkJoin([this.dataService.getTeamPLReport(request)])
        .subscribe(([plReports]) => {
          window.scrollTo(0, 0);
          const temp = plReports as any[];
          this.handleOutput(temp);
          this.spinner.hide();
        },
        (error => {
          this.spinner.hide();
          this.alertService.error(error);
        })
      );
  }
  public showReport = (plReportFormValue) => {
    if (this.plReportForm.valid) {
      this.spinner.show();
      this.executeGetReport(plReportFormValue);
    }
  }

  private executeGetReport = (plReportFormValue) => {
    const request: PLReportRequest = {
      fromDate: plReportFormValue.fromdate,
      toDate: plReportFormValue.todate
    };
    this.dataService.getTeamPLReport(request)
      .subscribe((res: PLReportResponse[]) => {
        window.scrollTo(0, 0);
        const temp = res as PLReportResponse[];
        this.handleOutput(temp);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  private handleOutput(response: PLReportResponse[]): void {
    if (response.length > 0 && response[0].details !== null && response[0].details.length > 0) {
      for (var j = 0; j < response.length; j++) {
        var obj = response[j];
        obj['Team Leader'] = obj.salesPersonName;
        obj['Revenue'] = obj.revenue;
        obj['Gross Profilt'] = obj.grossProfit;
        delete obj.salesPersonName;
        delete obj.employeeId;
        delete obj.revenue;
        delete obj.grossProfit;
        for (var i = 0; i < response[j].details.length; i++) {
          var o = response[j].details[i];
          o['Hrs'] = o.regHours;
          o['OT Hrs'] = o.otHours;
          o['DT Hrs'] = o.dtHours;
          o['Total Hrs'] = o.totalHours;
          o['Revenue'] = o.revenue;
          o['Labor Cost'] = o.laborCost;
          o['Labor %'] = o.laborCostToRevenueRatio;
          o['Contr Burden'] = o.contractBurden;
          o['Perm Burden'] = o.permBurden;
          o['Perm Cost'] = o.permCost;
          o['Contr Profit'] = o.contractProfit;
          o['Perm Profit'] = o.permProfit;
          o['Gross Profit'] = o.grossProfit;
          o['Recruiter Cost'] = o.recruiterCost;
          o['Comm Base'] = o.monthlyCommissionBase;
          o['Sales Comm'] = o.salesCommission;
          o['Comm Rate'] = o.commissionRate;
          o['Direct SGA'] = o.directSGA;
          o['Sales Salary'] = o.salesSalary;
          o['Earning'] = o.salesEarning;
          o['ME/CB'] = o.earningToCommissionRatio;
          delete o.regHours;
          delete o.otHours;
          delete o.dtHours;
          delete o.totalHours;
          delete o.revenue;
          delete o.laborCost;
          delete o.laborCostToRevenueRatio;
          delete o.contractBurden;
          delete o.contractProfit;
          delete o.permBurden;
          delete o.permCost;
          delete o.permProfit;
          delete o.grossProfit;
          delete o.recruiterCost;
          delete o.monthlyCommissionBase;
          delete o.salesCommission;
          delete o.commissionRate;
          delete o.directSGA;
          delete o.salesSalary;
          delete o.salesEarning;
          delete o.earningToCommissionRatio;
          if (o.details.length === 0) {
            delete o.details;
          } else {
            /* o.details.forEach((item, index) => {
              item.commission = +this.decimalPipe.transform(item.commission, '1.2-2');
              item.expense = +this.decimalPipe.transform(item.expense, '1.2-2');
              item.salary = +this.decimalPipe.transform(item.salary, '1.2-2');
            }); */
            o.details.forEach((item, index) => {
              delete item.employeeId;
            });
          }
        }
      }
      this.myData = response.filter(x => x.details.length > 0);
    }
  }
}
