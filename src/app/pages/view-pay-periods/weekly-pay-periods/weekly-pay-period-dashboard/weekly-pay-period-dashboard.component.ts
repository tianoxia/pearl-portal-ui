import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-weekly-pay-period-dashboard',
  templateUrl: './weekly-pay-period-dashboard.component.html',
  styleUrls: ['./weekly-pay-period-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WeeklyPayPeriodDashboardComponent implements OnInit {
  weekEndings: Date[] = [];
  payDate: Date;
  payType: string;
  selected: Date;
  constructor(private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private datePipe: DatePipe) { }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.queryParamMap.subscribe(params => {
      this.payType = params.get('paytype');
      this.payDate = new Date(params.get('paydate'));
      this.weekEndings.push(new Date(params.get('weekending')));
      this.selected = this.weekEndings[0];
    });
  }
}
