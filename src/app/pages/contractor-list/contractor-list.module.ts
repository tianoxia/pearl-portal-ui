import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './contractor-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { AddEditContractorComponent } from './add-edit-contractor/add-edit-contractor.component';

@NgModule({
  declarations: [
    AddEditContractorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class ContractorListModule { }
