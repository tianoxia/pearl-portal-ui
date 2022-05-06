import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './contact-list.routing';
import { SharedModule } from '../../../shared/shared.module';
import { AddEditContactComponent } from './add-edit-contact/add-edit-contact.component';
import { ContactListComponent } from './contact-list.component';

@NgModule({
  declarations: [
    AddEditContactComponent,
    ContactListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ],
  exports: [ ContactListComponent ]
})
export class ContactListModule { }
