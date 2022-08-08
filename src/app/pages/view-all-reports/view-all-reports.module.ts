import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './view-all-reports.routing';
import { SharedModule } from '../../shared/shared.module';
import { ViewSummaryReportComponent } from './view-summary-report/view-summary-report.component';
import { ViewCustomReportComponent } from './view-custom-report/view-custom-report.component';
import { ViewTeamPlReportComponent } from './view-team-pl-report/view-team-pl-report.component';
import { NewAssignmentListComponent } from './new-assignment-list/new-assignment-list.component';
import { SearchAssignmentListComponent } from './search-assignment-list/search-assignment-list.component';

@NgModule({
  declarations: [
    ViewSummaryReportComponent,
    ViewCustomReportComponent,
    ViewTeamPlReportComponent,
    NewAssignmentListComponent,
    SearchAssignmentListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class ViewAllReportsModule { }
