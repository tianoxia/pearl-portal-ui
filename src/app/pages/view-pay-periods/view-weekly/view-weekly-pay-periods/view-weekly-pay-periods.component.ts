import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { AlertService, DataService } from 'app/_services';
import { PayPeriodsResponse } from 'app/_models';

@Component({
  selector: 'app-view-weekly-pay-periods',
  templateUrl: './view-weekly-pay-periods.component.html',
  styleUrls: ['./view-weekly-pay-periods.component.css']
})
export class ViewWeeklyPayPeriodsComponent implements OnInit {
payPeriods: PayPeriodsResponse[];
limit = 10;
  constructor(public alertService: AlertService,
    private dataService: DataService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.loadData();
  }
  private loadData() {
    this.alertService.clear();
    this.dataService.getAllPayPeriods('W')
      .subscribe((res: PayPeriodsResponse[]) => {
        this.payPeriods = res;
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
}
