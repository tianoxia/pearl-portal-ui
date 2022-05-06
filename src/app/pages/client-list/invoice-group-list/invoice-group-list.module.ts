import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './invoice-group-list.routing';
import { SharedModule } from '../../../shared/shared.module';
import { AddEditInvoiceGroupComponent } from './add-edit-invoice-group/add-edit-invoice-group.component';
import { InvoiceGroupListComponent } from './invoice-group-list.component';

@NgModule({
  declarations: [
    AddEditInvoiceGroupComponent,
    InvoiceGroupListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ],
  exports: [ InvoiceGroupListComponent ]
})
export class InvoiceGroupListModule { }
