import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { dashboardrouting } from './biweekly-pay-periods.routing';
import { SharedModule } from '../../../../shared/shared.module';
import { BiWeeklyPayPeriodDashboardComponent } from './biweekly-pay-period-dashboard/biweekly-pay-period-dashboard.component';

@NgModule({
  declarations: [
    BiWeeklyPayPeriodDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    dashboardrouting
  ],
  providers: [
    DatePipe
  ]
})
export class ViewBiWeeklyPayPeriodsModule { }
