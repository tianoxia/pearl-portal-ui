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
import { ViewPayrollReportComponent } from './view-payroll-report/view-payroll-report.component';
import { ViewEmployeeHoursComponent } from './view-employee-hours/view-employee-hours.component';

const childRoutes: Routes = [
  { path: 'weekly-pay-periods', component: WeeklyPayPeriodsComponent },
  { path: 'biweekly-pay-periods', component: BiWeeklyPayPeriodsComponent },
  { path: 'view-invoices', component: ViewInvoicesComponent },
  { path: 'print-invoices', component: PrintInvoicesComponent },
  { path: 'view-monthly-control-report', component: ViewMonthlyControlReportComponent },
  { path: 'view-control-report', component: ViewControlReportComponent },
  { path: 'view-commission-report', component: ViewCommissionReportComponent },
  { path: 'view-commission-detail-report', component: ViewCommissionDetailReportComponent },
  { path: 'view-assignment-hours', component: ViewAssignmentHoursComponent },
  { path: 'view-referal-report', component: ViewReferalReportComponent },
  { path: 'view-leaderboard-report', component: ViewLeaderboardReportComponent },
  { path: 'view-headcount-report', component: ViewHeadCountReportComponent },
  { path: 'view-gross-profit-report', component: ViewGrossProfitReportComponent },
  { path: 'view-payroll-report', component: ViewPayrollReportComponent },
  { path: 'view-employee-hours', component: ViewEmployeeHoursComponent }
];

export const routing = RouterModule.forChild(childRoutes);
