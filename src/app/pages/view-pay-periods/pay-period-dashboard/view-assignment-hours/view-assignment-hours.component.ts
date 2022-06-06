import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertService, AssignmentHoursService, KeyBoardService } from 'app/_services';
import { AssignmentHoursResponse, AssignmentHoursRequest, IApiResponse } from 'app/_models';
import { ArrowDivDirective } from 'app/shared/directives/arrow-div.directive';

export const data = [["uno", "one"], ["dos", "two"], ["tres", "three"]];
@Component({
  selector: 'app-view-assignment-hours',
  templateUrl: './view-assignment-hours.component.html',
  styleUrls: ['./view-assignment-hours.component.css']
})
export class ViewAssignmentHoursComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChildren(ArrowDivDirective) inputs: QueryList<ArrowDivDirective>;
  @Input() assignmentHoursForm: FormGroup;
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
  public displayedColumns = ['assignment', 'description',
    'hours', 'otHours', 'dtHours', 'payRate', 'otRate',
    'dtRate', 'billRate', 'otBillRate', 'dtBillRate', 'burdenRate', 'expCost', 'notes',
    'ppExp', 'oopExp', 'expAllowance'];
  public dataSource = new MatTableDataSource<AssignmentHoursResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    private fb: FormBuilder, private route: ActivatedRoute,
    private assignmentHoursService: AssignmentHoursService,
    private datePipe: DatePipe,
    private keyboardService: KeyBoardService,
    private router: Router,
    private spinner: NgxSpinnerService) {

    this.assignmentHoursForm = this.fb.group({
      assignmentHours: this.fb.array([])      
    });
  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.payDate = new Date(params.get('paydate'));
      this.altWeekEnding = params.get('altweekending') ? new Date(params.get('altweekending')) : null;
      this.payPeriodId = +params.get('payperiodid');
      this.weekEnding = new Date(params.get('weekending'));
      this.payFrequency = params.get('payfrequency');
      this.loadData();
    });
  }

  private loadData() {
    const request: AssignmentHoursRequest = new AssignmentHoursRequest();
    request.payPeriodId = this.payPeriodId;
    request.payFrequency = this.payFrequency;
    request.weekEnding = this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd');
    this.assignmentHoursService.getAssignmentHours(request)
      .subscribe((assignmentHoursReports: AssignmentHoursResponse[]) => {
        this.dataSource.data = assignmentHoursReports;
        this.dataSource.sort = this.sort;
        this.setAssignmentHoursForm();
        this.subTitle = 'for Week Ending ' + this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') + ' (' + this.dataSource.data.length + ' Records)';
        this.spinner.hide();
        this.keyboardService.keyBoard.subscribe(res => {
          this.move(res);
        });
      },
        (error => {
          this.spinner.hide();
          this.alertService.error(error);
        })
      );
  }
  private setAssignmentHoursForm(){
    const assignmentHoursCtrl = this.assignmentHoursForm.get('assignmentHours') as FormArray;
    this.dataSource.data.forEach((hr)=>{
      assignmentHoursCtrl.push(this.setAssignmentHoursFormArray(hr));
    });
  };
  private setAssignmentHoursFormArray(hour){
    return this.fb.group({
      assignmentId: [hour.assignmentId],
      hours: [hour.hours],
      otHours: [hour.otHours],
      dtHours: [hour.dtHours],
      payRate: [hour.payRate],
      otRate: [hour.otRate],
      dtRate: [hour.dtRate],
      burdenRate: [hour.burdenRate],
      ppExp: [hour.ppExp],
      oopExp: [hour.oopExp],
      expAllowance: [hour.expAllowance],
      expCost: [hour.expCost],
      billRate: [hour.billRate],
      otBillRate: [hour.otBillRate],
      dtBillRate: [hour.billRate],
      notes: [hour.notes],
      hoursId: [hour.assignmentHoursId],
      hoursRecordType: [hour.hoursRecordType]
    });
  }
  move(object) {
    const inputToArray = this.inputs.toArray();
    const rows = this.dataSource.data.length;
    const cols = this.displayedColumns.length;
    let index = inputToArray.findIndex(x => x.element === object.element);
    switch (object.action) {
      case "UP":
        index--;
        break;
      case "DOWN":
        index++;
        break;
      case "LEFT":
        if (index - rows >= 0) index -= rows;
        else {
          let rowActual = index % rows;
          if (rowActual > 0) index = rowActual - 1 + (cols - 1) * rows;
        }
        break;
      case "RIGTH":
        console.log(index + rows, inputToArray.length);
        if (index + rows < inputToArray.length) index += rows;
        else {
          let rowActual = index % rows;
          if (rowActual < rows - 1) index = rowActual + 1;
        }
        break;
    }
    if (index >= 0 && index < this.inputs.length) {
      inputToArray[index].element.nativeElement.focus();
    }
  }
  public addEditAssignmentHours = () => {
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.assignmentHoursForm.invalid) {
        return;
    }

    this.spinner.show();
    let hours: AssignmentHoursRequest[];
    hours = this.assignmentHoursForm.value.assignmentHours.map(hoursRecord => ({ 
      payPeriodId: this.payPeriodId,
      payFrequency: this.payFrequency,
      weekEnding: this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'),
      assignmentId: +hoursRecord.assignmentId,
      hours: +hoursRecord.hours,
      overTimeHours: +hoursRecord.otHours,
      dtHours: +hoursRecord.dtHours,
      payRate: +hoursRecord.payRate,
      otRate: +hoursRecord.otRate,
      dtRate: +hoursRecord.dtRate,
      burdenRate: +hoursRecord.burdenRate,
      averyPrePaidExpenses: +hoursRecord.ppExp,
      averyOutOfPocketExpenses: +hoursRecord.oopExp,
      expenseAllowance: +hoursRecord.expAllowance,
      expenses: +hoursRecord.expCost,
      billRate: +hoursRecord.billRate,
      otBillRate: +hoursRecord.otBillRate,
      dtBillRate: +hoursRecord.dtBillRate,
      notes: hoursRecord.notes,
      hoursId: +hoursRecord.hoursId,
      hoursRecordType: hoursRecord.hoursRecordType
    }));
    this.createUpdateAssignmentHours(hours);
  }

  private createUpdateAssignmentHours(hoursRecord: AssignmentHoursRequest[]) {
    //const request = this.setAssignmentHoursRequest(hoursRecord) as AssignmentHoursRequest;    
    this.assignmentHoursService.createUpdateAssignmentHours(hoursRecord)
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
  private setAssignmentHoursRequest(hoursRecord: any): AssignmentHoursRequest {
    return {
      payPeriodId: this.payPeriodId,
      payFrequency: this.payFrequency,
      weekEnding: this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'),
      assignmentId: hoursRecord.assignmentId,
      hours: hoursRecord.hours,
      overTimeHours: hoursRecord.otHours,
      dtHours: hoursRecord.dtHours,
      payRate: hoursRecord.payRate,
      otRate: hoursRecord.otRate,
      dtRate: hoursRecord.dtRate,
      burdenRate: hoursRecord.burdenRate,
      averyPrePaidExpenses: hoursRecord.ppExp,
      averyOutOfPocketExpenses: hoursRecord.oopExp,
      expenseAllowance: hoursRecord.expAllowance,
      expenses: hoursRecord.expCost,
      billRate: hoursRecord.billRate,
      otBillRate: hoursRecord.otBillRate,
      dtBillRate: hoursRecord.dtBillRate,
      notes: hoursRecord.notes,
      hoursId: hoursRecord.hoursId
    } as AssignmentHoursRequest;
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
