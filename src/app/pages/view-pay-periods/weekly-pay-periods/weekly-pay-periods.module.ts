import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { dashboardrouting } from './weekly-pay-periods.routing';
import { SharedModule } from '../../../shared/shared.module';
import { WeeklyPayPeriodDashboardComponent } from './weekly-pay-period-dashboard/weekly-pay-period-dashboard.component';

@NgModule({
  declarations: [
    WeeklyPayPeriodDashboardComponent
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
export class ViewWeeklyPayPeriodsModule { }
