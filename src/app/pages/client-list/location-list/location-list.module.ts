import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './location-list.routing';
import { SharedModule } from '../../../shared/shared.module';
import { AddEditLocationComponent } from './add-edit-location/add-edit-location.component';
import { LocationListComponent } from './location-list.component';

@NgModule({
  declarations: [
    AddEditLocationComponent,
    LocationListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ],
  exports: [ LocationListComponent ]
})
export class LocationListModule { }
