import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './client-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { AddEditClientComponent } from './add-edit-client/add-edit-client.component';

@NgModule({
  declarations: [
    AddEditClientComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class ClientListModule { }
