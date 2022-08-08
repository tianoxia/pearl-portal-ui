import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { AlertService, EmployeeHoursService } from 'app/_services';
import { EmployeeHoursResponse, EmployeeHoursRequest, IApiResponse } from 'app/_models';

@Component({
  selector: 'app-view-employee-hours',
  templateUrl: './view-employee-hours.component.html',
  styleUrls: ['./view-employee-hours.component.css']
})
export class ViewEmployeeHoursComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() employeeHoursForm: FormGroup;
  subTitle: string;
  payDate: Date;
  weekEnding: Date;
  altWeekEnding: Date;
  payPeriodId: number;
  payFrequency: string;
  columns: number;
  displayedHeads: string[];
  myformArray: FormArray;
  floatLabelControl = new FormControl('auto');
  public displayedColumns = ['firstName', 'hours', 'otHours', 'dtHours', 'payRate', 'otRate',
    'dtRate', 'expenses', 'advances', 'commissions', 'notes'];
  public dataSource = new MatTableDataSource<EmployeeHoursResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    private fb: FormBuilder, private route: ActivatedRoute,
    private employeeHoursService: EmployeeHoursService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private router: Router) {

    this.employeeHoursForm = this.fb.group({
      employeeHours: this.fb.array([])
    });
  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.payDate = new Date(params.get('paydate'));
      this.altWeekEnding = params.get('altweekending') ? new Date(params.get('altweekending')) : null;
      this.weekEnding = new Date(params.get('weekending'));
      this.payFrequency = params.get('payfrequency');
      this.loadData();
    });
  }

  private loadData() {
    const request: EmployeeHoursRequest = new EmployeeHoursRequest();
    request.weekEnding = this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd');
    this.employeeHoursService.getEmployeeHours(request)
      .subscribe((employeeHoursReports: EmployeeHoursResponse[]) => {
        this.dataSource.data = employeeHoursReports;
        this.dataSource.sort = this.sort;
        this.setEmployeeHoursForm();
        this.subTitle = 'for Week Ending ' + this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') + ' (' + this.dataSource.data.length + ' Records)';
        this.spinner.hide();
      },
        (error => {
          this.spinner.hide();
          this.alertService.error(error);
        })
      );
  }
  private setEmployeeHoursForm() {
    const employeeHoursCtrl = this.employeeHoursForm.get('employeeHours') as FormArray;
    this.dataSource.data.forEach((hr) => {
      employeeHoursCtrl.push(this.setEmployeeHoursFormArray(hr));
    });
  };
  private setEmployeeHoursFormArray(hour) {
    return this.fb.group({
      employeeId: [hour.employeeId],
      hours: [hour.hours],
      otHours: [hour.otHours],
      dtHours: [hour.dtHours],
      payRate: [hour.payRate],
      otRate: [hour.otRate],
      dtRate: [hour.dtRate],
      expenses: [hour.expenses],
      commissions: [hour.commissions],
      advances: [hour.advances],
      notes: [hour.notes],
      hoursId: [hour.employeeHoursId],
      hoursRecordType: [hour.hoursRecordType]
    });
  }

  public addEditEmployeeHours = () => {
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.employeeHoursForm.invalid) {
        return;
    }

    this.spinner.show();
    let hours: EmployeeHoursRequest[];
    hours = this.employeeHoursForm.value.employeeHours.map(hoursRecord => ({
      employeeHoursId: +hoursRecord.hoursId,
      weekEnding: this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'),
      employeeId: +hoursRecord.employeeId,
      hours: +hoursRecord.hours,
      overTimeHours: +hoursRecord.otHours,
      dtHours: +hoursRecord.dtHours,
      payRate: +hoursRecord.payRate,
      otRate: +hoursRecord.otRate,
      dtRate: +hoursRecord.dtRate,
      expenses: +hoursRecord.expenses,
      commissions: +hoursRecord.commissions,
      advances: +hoursRecord.advances,
      notes: hoursRecord.notes,
      hoursRecordType: hoursRecord.hoursRecordType
    }));
    this.createUpdateEmployeeHours(hours);
  }

  private createUpdateEmployeeHours(hoursRecord: EmployeeHoursRequest[]) {
    //const request = this.setEmployeeHoursRequest(hoursRecord) as EmployeeHoursRequest;    
    this.employeeHoursService.createUpdateEmployeeHours(hoursRecord)
        .subscribe((response: IApiResponse) => {
          window.scrollTo(0, 0);
          this.spinner.hide();
          this.alertService.success(response.message);
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
  }
  back(): void {
    if (this.payFrequency === 'Biweekly') {
      this.router.navigate(['view-pay-periods/pay-period-dashboard/biweekly-pay-periods/biweekly-pay-period-dashboard'],
      {queryParams: {weekending: this.weekEnding, altweekending: this.altWeekEnding, pagetype: 'report',
      payperiodid: this.payPeriodId, paydate: this.payDate, paytype: this.payFrequency}});
    } else {
      this.router.navigate(['view-pay-periods/pay-period-dashboard/weekly-pay-periods/weekly-pay-period-dashboard'],
      {queryParams: {weekending: this.weekEnding, pagetype: 'report',
      payperiodid: this.payPeriodId, paydate: this.payDate, paytype: this.payFrequency}});
    }
  }
}
