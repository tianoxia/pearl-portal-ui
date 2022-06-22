import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pay-period-dashboard',
  templateUrl: './pay-period-dashboard.component.html',
  styleUrls: ['./pay-period-dashboard.component.css']
})
export class PayPeriodDashboardComponent implements OnInit {
  payFrequency: string;
  constructor(private spinner: NgxSpinnerService, private route: ActivatedRoute,
    private router: Router) { }
  back(): void {
    this.router.navigate(['view-pay-periods']);
  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.queryParamMap.subscribe(params => {      
      this.payFrequency = params.get('payfrequency');
      this.spinner.hide();
    });
  }

  navigateToPayPeriod(pageType: string) {
    this.router.navigate(this.payFrequency === 'Weekly' ? ['weekly-pay-periods'] : ['biweekly-pay-periods'], {queryParams: { pagetype: pageType}, relativeTo: this.route});
  }
}
