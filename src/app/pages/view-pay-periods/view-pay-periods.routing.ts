import { Routes, RouterModule } from '@angular/router';
import { WeeklyPayPeriodsComponent } from './weekly-pay-periods/weekly-pay-periods.component';
import { AuthGuard } from '../../_helpers';
import { ViewInvoicesComponent } from './view-invoices/view-invoices.component';
import { ViewMonthlyControlReportComponent } from './view-monthly-control-report/view-monthly-control-report.component';
import { PrintInvoicesComponent } from './print-invoices/print-invoices.component';

const childRoutes: Routes = [
  { path: 'weekly-pay-periods', component: WeeklyPayPeriodsComponent },
  { path: 'view-invoices', component: ViewInvoicesComponent, canActivate: [AuthGuard]},
  { path: 'print-invoices', component: PrintInvoicesComponent, canActivate: [AuthGuard]},
  { path: 'view-monthly-control-report', component: ViewMonthlyControlReportComponent, canActivate: [AuthGuard]}
];

export const routing = RouterModule.forChild(childRoutes);
