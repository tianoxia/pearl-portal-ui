import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './provider-employee-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { AddEditProviderEmployeeComponent } from './add-edit-provider-employee/add-edit-provider-employee.component';

@NgModule({
  declarations: [
    AddEditProviderEmployeeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class ProviderEmployeeListModule { }
