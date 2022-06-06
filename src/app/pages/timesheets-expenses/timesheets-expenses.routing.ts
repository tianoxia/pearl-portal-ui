import { Routes, RouterModule } from '@angular/router';
import { ReleaseTimesheetsComponent } from './release-timesheets/release-timesheets.component';
import { ReleaseExpensesComponent } from './release-expenses/release-expenses.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'release-timesheets', component: ReleaseTimesheetsComponent },
  { path: 'release-expenses', component: ReleaseExpensesComponent }
];

export const routing = RouterModule.forChild(childRoutes);
