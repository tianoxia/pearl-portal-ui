import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './_helpers';
import { ViewAllReportsComponent } from './pages/view-all-reports/view-all-reports.component';
import { ContractorListComponent } from './pages/contractor-list/contractor-list.component';
import { ViewPayPeriodsComponent } from './pages/view-pay-periods/view-pay-periods.component';

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
  { path: 'login', component: LoginComponent },
  { path: 'view-all-reports', component: ViewAllReportsComponent, canActivate: [AuthGuard]},
  { path: 'contractor-list', component: ContractorListComponent, canActivate: [AuthGuard] },
  { path: 'view-pay-periods', component: ViewPayPeriodsComponent, canActivate: [AuthGuard]}
];

export const routing = RouterModule.forRoot(appRoutes);
