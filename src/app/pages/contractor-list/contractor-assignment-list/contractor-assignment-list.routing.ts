import { Routes, RouterModule } from '@angular/router';
import { AddEditAssignmentComponent } from './add-edit-contractor-assignment/add-edit-contractor-assignment.component';
import { ViewAssignmentComponent } from './view-contractor-assignment/view-contractor-assignment.component';

const childRoutes: Routes = [
  { path: 'add-contractor-assignment/:contractorId', component: AddEditAssignmentComponent },
  { path: 'edit-contractor-assignment/:assignmentId/:contractorId', component: AddEditAssignmentComponent },
  { path: 'view-contractor-assignment/:assignmentId/:contractorId', component: ViewAssignmentComponent }
];

export const routing = RouterModule.forChild(childRoutes);
