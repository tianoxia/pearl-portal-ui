import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './timesheets-expenses.routing';
import { SharedModule } from '../../shared/shared.module';
import { ReleaseTimesheetsComponent } from './release-timesheets/release-timesheets.component';
import { ReleaseExpensesComponent } from './release-expenses/release-expenses.component';

@NgModule({
  declarations: [
    ReleaseTimesheetsComponent,
    ReleaseExpensesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class TimesheetsExpensesModule { }
