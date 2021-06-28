import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './view-pay-periods.routing';
import { SharedModule } from '../../shared/shared.module';
import { ViewWeeklyPayPeriodsComponent } from './view-weekly/view-weekly-pay-periods/view-weekly-pay-periods.component';

@NgModule({
  declarations: [
    ViewWeeklyPayPeriodsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ],
  providers: [
    DatePipe
  ]
})
export class ViewPayPeriodsModule { }
