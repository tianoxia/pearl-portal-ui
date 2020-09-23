import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AccountProfileComponent } from './pages/account-management/account-profile/account-profile.component';
import { AccountManagementComponent } from './pages/account-management/account-management.component';
import { AuthGuard } from './_helpers';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { MyProfileComponent } from './pages/account-management/my-profile/my-profile.component';


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
  {
      path: 'account-management',
      redirectTo: 'pages/account-management',
      pathMatch: 'full'
  },
  {
      path: 'forgot-password',
      redirectTo: 'pages/forgot-password',
      pathMatch: 'full'
  },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account-profile', component: AccountProfileComponent, canActivate: [AuthGuard]},
  { path: 'account-management', component: AccountManagementComponent, canActivate: [AuthGuard]},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard]}
];

export const routing = RouterModule.forRoot(appRoutes);
