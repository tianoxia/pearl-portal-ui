import { Routes, RouterModule } from '@angular/router';
import { AddEditAssignmentComponent } from './add-edit-assignment/add-edit-assignment.component';
import { ViewAssignmentComponent } from './view-assignment/view-assignment.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'add-assignment', component: AddEditAssignmentComponent },
  { path: 'edit-assignment/:assignmentId', component: AddEditAssignmentComponent },
  { path: 'view-assignment/:assignmentId', component: ViewAssignmentComponent }
];

export const routing = RouterModule.forChild(childRoutes);
