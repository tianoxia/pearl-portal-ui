import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { routing } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';

import { LayoutModule } from './shared/layout/layout.module';
import { SharedModule } from './shared/shared.module';
import { AppConfig } from './app.config';
import { KeyBoardService, NavigationService } from './_services';
import { AuthGuard, JwtInterceptor } from './_helpers';
import { AppComponent } from './app.component';
import { LoginComponent, LoginHelpDialogComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ViewAllReportsComponent } from './pages/view-all-reports/view-all-reports.component';
import { ViewAllReportsModule } from './pages/view-all-reports/view-all-reports.module';
import { ContractorListComponent } from './pages/contractor-list/contractor-list.component';
import { ContractorListModule } from './pages/contractor-list/contractor-list.module';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeListModule } from './pages/employee-list/employee-list.module';
import { ProviderEmployeeListComponent } from './pages/provider-employee-list/provider-employee-list.component';
import { ProviderEmployeeListModule } from './pages/provider-employee-list/provider-employee-list.module';
import { ViewPayPeriodsModule } from './pages/view-pay-periods/view-pay-periods.module';
import { ViewPayPeriodsComponent } from './pages/view-pay-periods/view-pay-periods.component';
import { AssignmentListComponent } from './pages/assignment-list/assignment-list.component';
import { AssignmentListModule } from './pages/assignment-list/assignment-list.module';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AddEditPayPeriodComponent } from './pages/view-pay-periods/add-edit-pay-period/add-edit-pay-period.component';
import { ArrowDivDirective } from './shared/directives/arrow-div.directive';
import { AccountManagementModule } from './pages/account-management/account-management.module';
import { ClientListComponent } from './pages/client-list/client-list.component';
import { ClientListModule } from './pages/client-list/client-list.module';
import { TimesheetsExpensesModule } from './pages/timesheets-expenses/timesheets-expenses.module';
import { TimesheetsExpensesComponent } from './pages/timesheets-expenses/timesheets-expenses.component';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    routing,
    HttpClientModule,
    CommonModule,
    LayoutModule,
    SharedModule,
    FormsModule,
    NgxSpinnerModule,
    ViewAllReportsModule,
    ViewPayPeriodsModule,
    ContractorListModule,
    EmployeeListModule,
    ProviderEmployeeListModule,
    AssignmentListModule,
    ClientListModule,
    AccountManagementModule,
    NgbModule,
    TimesheetsExpensesModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    LoginHelpDialogComponent,
    HomeComponent,
    ViewAllReportsComponent,
    ContractorListComponent,
    EmployeeListComponent,
    ProviderEmployeeListComponent,
    ViewPayPeriodsComponent,
    AssignmentListComponent,
    ClientListComponent,
    UnauthorizedComponent,
    AddEditPayPeriodComponent,
    ArrowDivDirective,
    TimesheetsExpensesComponent
  ],
  providers: [
    AppConfig, AuthGuard,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    KeyBoardService
 ],
  bootstrap: [AppComponent],
  entryComponents: [LoginHelpDialogComponent, AddEditPayPeriodComponent]
})
export class AppModule { }
