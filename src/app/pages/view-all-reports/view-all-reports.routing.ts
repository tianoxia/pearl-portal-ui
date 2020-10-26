import { Routes, RouterModule } from '@angular/router';
import { ViewSummaryReportComponent } from './view-summary-report/view-summary-report.component';
import { ViewCustomReportComponent } from './view-custom-report/view-custom-report.component';
import { ViewPlReportComponent } from './view-pl-report/view-pl-report.component';

const childRoutes: Routes = [
  { path: 'view-summary-report', component: ViewSummaryReportComponent},
  { path: 'view-custom-report', component: ViewCustomReportComponent},
  { path: 'view-pl-report', component: ViewPlReportComponent}
];

export const routing = RouterModule.forChild(childRoutes);
