import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './contractor-assignment-list.routing';
import { SharedModule } from '../../../shared/shared.module';
import { AddEditAssignmentComponent } from './add-edit-contractor-assignment/add-edit-contractor-assignment.component';
import { ViewAssignmentComponent } from './view-contractor-assignment/view-contractor-assignment.component';
import { AssignmentListComponent } from './contractor-assignment-list.component';
import { UpdateAssignmentEndDateComponent } from './update-assignment-enddate/update-assignment-enddate.component';

@NgModule({
  declarations: [
    AddEditAssignmentComponent,
    ViewAssignmentComponent,
    AssignmentListComponent,
    UpdateAssignmentEndDateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing
  ],
  exports: [ AssignmentListComponent ],
  entryComponents: [UpdateAssignmentEndDateComponent]
})
export class AssignmentListModule { }
