import { Routes, RouterModule } from '@angular/router';
import { BiWeeklyPayPeriodDashboardComponent } from './biweekly-pay-period-dashboard/biweekly-pay-period-dashboard.component';

const childRoutes: Routes = [
  { path: 'biweekly-pay-period-dashboard', component: BiWeeklyPayPeriodDashboardComponent }
];

export const dashboardrouting = RouterModule.forChild(childRoutes);
