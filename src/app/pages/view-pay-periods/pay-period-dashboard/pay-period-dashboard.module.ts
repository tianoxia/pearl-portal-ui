import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './pay-period-dashboard.routing';
import { SharedModule } from '../../../shared/shared.module';
import { WeeklyPayPeriodsComponent } from './weekly-pay-periods/weekly-pay-periods.component';
import { ViewMonthlyControlReportComponent } from './view-monthly-control-report/view-monthly-control-report.component';
import { ViewControlReportComponent } from './view-control-report/view-control-report.component';
import { ViewInvoicesComponent } from './view-invoices/view-invoices.component';
import { PrintInvoicesComponent } from './print-invoices/print-invoices.component';

@NgModule({
  declarations: [
    WeeklyPayPeriodsComponent,
    ViewMonthlyControlReportComponent,
    ViewControlReportComponent,
    ViewInvoicesComponent,
    PrintInvoicesComponent
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
export class PayPeriodDashboardModule { }
