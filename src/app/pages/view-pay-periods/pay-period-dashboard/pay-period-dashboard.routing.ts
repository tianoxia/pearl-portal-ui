import { Routes, RouterModule } from '@angular/router';
import { WeeklyPayPeriodsComponent } from './weekly-pay-periods/weekly-pay-periods.component';
import { BiWeeklyPayPeriodsComponent } from './biweekly-pay-periods/biweekly-pay-periods.component';
import { AuthGuard } from '../../../_helpers';
import { ViewInvoicesComponent } from './view-invoices/view-invoices.component';
import { ViewMonthlyControlReportComponent } from './view-monthly-control-report/view-monthly-control-report.component';
import { ViewControlReportComponent } from './view-control-report/view-control-report.component';
import { PrintInvoicesComponent } from './print-invoices/print-invoices.component';
import { ViewCommissionReportComponent } from './view-commission-report/view-commission-report.component';
import { ViewCommissionDetailReportComponent } from './view-commission-detail-report/view-commission-detail-report.component';
import { ViewAssignmentHoursComponent } from './view-assignment-hours/view-assignment-hours.component';
import { ViewReferalReportComponent } from './view-referal-report/view-referal-report.component';
import { ViewLeaderboardReportComponent } from './view-leaderboard-report/view-leaderboard-report.component';
import { ViewHeadCountReportComponent } from './view-headcount-report/view-headcount-report.component';
import { ViewGrossProfitReportComponent } from './view-gross-profit-report/view-gross-profit-report.component';

const childRoutes: Routes = [
  { path: 'weekly-pay-periods', component: WeeklyPayPeriodsComponent },
  { path: 'biweekly-pay-periods', component: BiWeeklyPayPeriodsComponent },
  { path: 'view-invoices', component: ViewInvoicesComponent, canActivate: [AuthGuard]},
  { path: 'print-invoices', component: PrintInvoicesComponent, canActivate: [AuthGuard]},
  { path: 'view-monthly-control-report', component: ViewMonthlyControlReportComponent, canActivate: [AuthGuard]},
  { path: 'view-control-report', component: ViewControlReportComponent, canActivate: [AuthGuard]},
  { path: 'view-commission-report', component: ViewCommissionReportComponent, canActivate: [AuthGuard]},
  { path: 'view-commission-detail-report', component: ViewCommissionDetailReportComponent, canActivate: [AuthGuard]},
  { path: 'view-assignment-hours', component: ViewAssignmentHoursComponent, canActivate: [AuthGuard]},
  { path: 'view-referal-report', component: ViewReferalReportComponent, canActivate: [AuthGuard]},
  { path: 'view-leaderboard-report', component: ViewLeaderboardReportComponent, canActivate: [AuthGuard]},
  { path: 'view-headcount-report', component: ViewHeadCountReportComponent, canActivate: [AuthGuard]},
  { path: 'view-gross-profit-report', component: ViewGrossProfitReportComponent, canActivate: [AuthGuard]}
];

export const routing = RouterModule.forChild(childRoutes);
