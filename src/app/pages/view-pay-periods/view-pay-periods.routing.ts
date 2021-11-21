import { Routes, RouterModule } from '@angular/router';
import { PayPeriodDashboardComponent } from './pay-period-dashboard/pay-period-dashboard.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'pay-period-dashboard', component: PayPeriodDashboardComponent, canActivate: [AuthGuard]}
];

export const routing = RouterModule.forChild(childRoutes);
