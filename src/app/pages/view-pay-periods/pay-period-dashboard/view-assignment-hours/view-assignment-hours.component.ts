import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertService, DataService, ExportService, KeyBoardService } from 'app/_services';
import { AssignmentHoursResponse, AssignmentHoursRequest } from 'app/_models';
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
    fb: FormBuilder, private route: ActivatedRoute,
    private dataService: DataService,
    private datePipe: DatePipe,
    private keyboardService: KeyBoardService,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.assignmentHoursForm = fb.group({
        floatLabel: this.floatLabelControl,
        hours: [''],
        otHours: [''],
        dtHours: [''],
        payRate: [''],
        otRate: [''],
        dtRate: [''],
        burdenRate: [''],
        ppExp: [''],
        oopExp: [''],
        expAllowance: [''],
        expCost: [''],
        billRate: [''],
        otBillRate: [''],
        dtBillRate: [''],
        notes: ''
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
    const request: AssignmentHoursRequest = {
      weekEnding: this.weekEnding,
      payFrequency: this.payFrequency
    };
    this.dataService.getAssignmentHours(request)
      .subscribe((assignmentHoursReports: AssignmentHoursResponse[]) => {
        this.dataSource.data = assignmentHoursReports;
        this.dataSource.sort = this.sort;        
        this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.dataSource.data.length+' Records)';
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
  public showReport = (controlReportFormValue) => {
    if (this.assignmentHoursForm.valid) {
      this.spinner.show();
      this.executeGetReport(controlReportFormValue);
    }
  }

  private executeGetReport = (controlReportFormValue) => {
    const request: AssignmentHoursRequest = {
      weekEnding: this.weekEnding,
      payFrequency: this.payFrequency
    };
    this.dataService.getAssignmentHours(request)
      .subscribe((res: AssignmentHoursResponse[]) => {
        window.scrollTo(0, 0);
        this.dataSource.data = res as AssignmentHoursResponse[];
        this.dataSource.sort = this.sort;
        this.subTitle = 'for Week Ending '+this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy')+' ('+this.dataSource.data.length+' Records)';
        this.spinner.hide();
        this.columns = 17;
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
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
  updateReport() {
return false;
  }
}
