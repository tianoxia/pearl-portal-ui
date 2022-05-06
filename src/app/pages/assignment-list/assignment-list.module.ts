import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './assignment-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { AddEditAssignmentComponent } from './add-edit-assignment/add-edit-assignment.component';
import { ViewAssignmentComponent } from './view-assignment/view-assignment.component';

@NgModule({
  declarations: [
    AddEditAssignmentComponent,
    ViewAssignmentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ]
})
export class AssignmentListModule { }
