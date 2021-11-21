import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './view-pay-periods.routing';
import { SharedModule } from '../../shared/shared.module';
import { PayPeriodDashboardComponent } from './pay-period-dashboard/pay-period-dashboard.component';

@NgModule({
  declarations: [
    PayPeriodDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ],
  providers: [
    DatePipe
  ]
})
export class ViewPayPeriodsModule { }
