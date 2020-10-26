import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { routing } from './view-all-reports.routing';
import { SharedModule } from '../../shared/shared.module';
import { ViewSummaryReportComponent } from './view-summary-report/view-summary-report.component';
import { ViewCustomReportComponent } from './view-custom-report/view-custom-report.component';
import { ViewPlReportComponent } from './view-pl-report/view-pl-report.component';

@NgModule({
  declarations: [
    ViewSummaryReportComponent,
    ViewCustomReportComponent,
    ViewPlReportComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class ViewAllReportsModule { }
