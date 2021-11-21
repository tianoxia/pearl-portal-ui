import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './_helpers';
import { ViewAllReportsComponent } from './pages/view-all-reports/view-all-reports.component';
import { ContractorListComponent } from './pages/contractor-list/contractor-list.component';
import { AssignmentListComponent } from './pages/assignment-list/assignment-list.component';
import { ViewPayPeriodsComponent } from './pages/view-pay-periods/view-pay-periods.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'pages/home'
  },
  {
      path: 'login',
      redirectTo: 'pages/login',
      pathMatch: 'full'
  },
  {
      path: 'register',
      redirectTo: 'pages/register',
      pathMatch: 'full'
  },
  { path: 'home', component: HomeComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'login', component: LoginComponent },
  { path: 'view-all-reports', component: ViewAllReportsComponent, canActivate: [AuthGuard] },
  { path: 'contractor-list', component: ContractorListComponent, canActivate: [AuthGuard] },
  { path: 'assignment-list', component: AssignmentListComponent, canActivate: [AuthGuard] },
  { path: 'view-pay-periods', component: ViewPayPeriodsComponent, canActivate: [AuthGuard] },
  { path: 'view-pay-periods', loadChildren: () => import('./pages/view-pay-periods/view-pay-periods.module').then(m => m.ViewPayPeriodsModule),
  canActivate: [AuthGuard] },
  { path: 'view-pay-periods/pay-period-dashboard',
  loadChildren: () => import('./pages/view-pay-periods/pay-period-dashboard/pay-period-dashboard.module').then(m => m.PayPeriodDashboardModule),
  canActivate: [AuthGuard] },
  { path: 'view-pay-periods/pay-period-dashboard/weekly-pay-periods',
  loadChildren: () => import('./pages/view-pay-periods/pay-period-dashboard/weekly-pay-periods/weekly-pay-periods.module').then(m => m.ViewWeeklyPayPeriodsModule),
  canActivate: [AuthGuard] }
];

export const routing = RouterModule.forRoot(appRoutes);
