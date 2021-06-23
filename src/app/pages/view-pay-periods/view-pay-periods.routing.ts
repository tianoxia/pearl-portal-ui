import { Routes, RouterModule } from '@angular/router';
import { ViewWeeklyPayPeriodsComponent } from './view-weekly/view-weekly-pay-periods/view-weekly-pay-periods.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'view-weekly-pay-periods', component: ViewWeeklyPayPeriodsComponent, canActivate: [AuthGuard] }  
];

export const routing = RouterModule.forChild(childRoutes);
