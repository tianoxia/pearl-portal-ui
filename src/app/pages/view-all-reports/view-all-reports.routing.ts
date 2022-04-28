import { Routes, RouterModule } from '@angular/router';
import { ViewSummaryReportComponent } from './view-summary-report/view-summary-report.component';
import { ViewCustomReportComponent } from './view-custom-report/view-custom-report.component';
import { ViewTeamPlReportComponent } from './view-team-pl-report/view-team-pl-report.component';

const childRoutes: Routes = [
  { path: 'view-summary-report', component: ViewSummaryReportComponent },
  { path: 'view-custom-report', component: ViewCustomReportComponent },
  { path: 'view-team-pl-report', component: ViewTeamPlReportComponent }
];

export const routing = RouterModule.forChild(childRoutes);
