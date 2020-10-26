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
import { AuthGuard, JwtInterceptor } from './_helpers';
import { AppComponent } from './app.component';
import { LoginComponent, LoginHelpDialogComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ViewAllReportsComponent } from './pages/view-all-reports/view-all-reports.component';
import { ViewAllReportsModule } from './pages/view-all-reports/view-all-reports.module';

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
    NgbModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    LoginHelpDialogComponent,
    HomeComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ViewAllReportsComponent
  ],
  providers: [
    AppConfig, AuthGuard,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
 ],
  bootstrap: [AppComponent],
  entryComponents: [LoginHelpDialogComponent]
})
export class AppModule { }
