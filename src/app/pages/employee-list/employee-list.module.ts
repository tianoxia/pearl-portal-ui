import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './employee-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { AddEditEmployeeComponent } from './add-edit-employee/add-edit-employee.component';

@NgModule({
  declarations: [
    AddEditEmployeeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class EmployeeListModule { }
