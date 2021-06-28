import { Component, OnInit, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { DatePipe } from '@angular/common';

import { AlertService, DataService } from 'app/_services';
import { PayPeriodsResponse } from 'app/_models';

@Component({
  selector: 'app-view-weekly-pay-periods',
  templateUrl: './view-weekly-pay-periods.component.html',
  styleUrls: ['./view-weekly-pay-periods.component.css']
})
export class ViewWeeklyPayPeriodsComponent implements OnInit {
payPeriods: PayPeriodsResponse[] = [];
allPayPeriods: PayPeriodsResponse[];
months = new Set();
@Input() payPeriodsForm: FormGroup;
limit = 10;
  constructor(public alertService: AlertService,
    private dataService: DataService,
    private datePipe: DatePipe,
    fb: FormBuilder,
    private spinner: NgxSpinnerService) {
      this.payPeriodsForm = fb.group({
        payPeriodMonth: ''
      });
     }

  ngOnInit() {
    this.spinner.show();
    this.loadData();
  }
  private loadData() {
    this.alertService.clear();
    this.dataService.getAllPayPeriods('W')
      .subscribe((res: PayPeriodsResponse[]) => {
        this.allPayPeriods = this.payPeriods = res;
        this.months.add('All');
        res.forEach((x) => {
          const date = new Date(x.weekEnding1);
          const cal = date.getMonth() + 1 + '/' + date.getFullYear();
          this.months.add(cal);
        });
        this.payPeriodsForm.controls.payPeriodMonth.patchValue("All");
        window.scrollTo(0, 0);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  showMore() {
    this.limit += 10; 
  }
  showLess() {
    this.limit-= 10;
  }
  changeMonth(event: MatSelectChange) {
    const selected = event.value;
    if (selected === 'All') {
      this.payPeriods = this.allPayPeriods;
    } else {
      this.payPeriods = this.allPayPeriods.filter(x => this.buildMonthYear(x.weekEnding1) === selected) as PayPeriodsResponse[];
    }
    this.limit = 10;
  }

  buildMonthYear(input: Date) {
    const d = this.datePipe.transform(input, 'dd/M/yyyy');
    const weList = String(d).split('/');
    weList.splice(0, 1); // remove day from date
    return weList.join("/");
  }

  compareWeekEndings(o1: any, o2: any) {
    return (o1 == o2);
  }
}
