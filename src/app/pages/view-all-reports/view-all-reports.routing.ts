import { Routes, RouterModule } from '@angular/router';
import { ViewSummaryReportComponent } from './view-summary-report/view-summary-report.component';
import { ViewCustomReportComponent } from './view-custom-report/view-custom-report.component';
import { ViewPlReportComponent } from './view-pl-report/view-pl-report.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'view-summary-report', component: ViewSummaryReportComponent, canActivate: [AuthGuard] },
  { path: 'view-custom-report', component: ViewCustomReportComponent, canActivate: [AuthGuard] },
  { path: 'view-pl-report', component: ViewPlReportComponent, canActivate: [AuthGuard] }
];

export const routing = RouterModule.forChild(childRoutes);
