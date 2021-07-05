import { Routes, RouterModule } from '@angular/router';
import { WeeklyPayPeriodDashboardComponent } from './weekly-pay-period-dashboard/weekly-pay-period-dashboard.component';

const childRoutes: Routes = [
  { path: 'weekly-pay-period-dashboard', component: WeeklyPayPeriodDashboardComponent }
];

export const dashboardrouting = RouterModule.forChild(childRoutes);
