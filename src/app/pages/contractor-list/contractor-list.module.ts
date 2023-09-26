import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './contractor-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { AddEditContractorComponent } from './add-edit-contractor/add-edit-contractor.component';
import { MakeAnnouncementComponent } from './make-announcement/make-announcement.component';
import { ViewContractorComponent } from './view-contractor/view-contractor.component';
import { AssignmentListModule } from './contractor-assignment-list/contractor-assignment-list.module';

@NgModule({
  declarations: [
    AddEditContractorComponent,
    MakeAnnouncementComponent,
    ViewContractorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AssignmentListModule,
    SharedModule,
    routing
  ],
  entryComponents: [MakeAnnouncementComponent]
})
export class ContractorListModule { }
