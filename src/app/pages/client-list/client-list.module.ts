import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './client-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { AddEditClientComponent } from './add-edit-client/add-edit-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { LocationListModule } from './location-list/location-list.module';
import { ContactListModule } from './contact-list/contact-list.module';
import { InvoiceGroupListModule } from './invoice-group-list/invoice-group-list.module';

@NgModule({
  declarations: [
    AddEditClientComponent,
    ViewClientComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LocationListModule,
    ContactListModule,
    InvoiceGroupListModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class ClientListModule { }
