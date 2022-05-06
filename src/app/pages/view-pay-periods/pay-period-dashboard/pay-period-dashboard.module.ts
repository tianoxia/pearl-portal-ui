import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './pay-period-dashboard.routing';
import { SharedModule } from '../../../shared/shared.module';
import { WeeklyPayPeriodsComponent } from './weekly-pay-periods/weekly-pay-periods.component';
import { BiWeeklyPayPeriodsComponent } from './biweekly-pay-periods/biweekly-pay-periods.component';
import { ViewMonthlyControlReportComponent } from './view-monthly-control-report/view-monthly-control-report.component';
import { ViewControlReportComponent } from './view-control-report/view-control-report.component';
import { ViewInvoicesComponent } from './view-invoices/view-invoices.component';
import { PrintInvoicesComponent } from './print-invoices/print-invoices.component';
import { ViewCommissionReportComponent } from './view-commission-report/view-commission-report.component';
import { ViewCommissionDetailReportComponent } from './view-commission-detail-report/view-commission-detail-report.component';
import { ViewAssignmentHoursComponent } from './view-assignment-hours/view-assignment-hours.component';
import { ViewReferalReportComponent } from './view-referal-report/view-referal-report.component';
import { ViewLeaderboardReportComponent } from './view-leaderboard-report/view-leaderboard-report.component';
import { ViewHeadCountReportComponent } from './view-headcount-report/view-headcount-report.component';
import { ViewGrossProfitReportComponent } from './view-gross-profit-report/view-gross-profit-report.component';


@NgModule({
  declarations: [
    WeeklyPayPeriodsComponent,
    BiWeeklyPayPeriodsComponent,
    ViewMonthlyControlReportComponent,
    ViewControlReportComponent,
    ViewInvoicesComponent,
    PrintInvoicesComponent,
    ViewCommissionReportComponent,
    ViewCommissionDetailReportComponent,
    ViewAssignmentHoursComponent,
    ViewReferalReportComponent,
    ViewLeaderboardReportComponent,
    ViewHeadCountReportComponent,
    ViewGrossProfitReportComponent
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
