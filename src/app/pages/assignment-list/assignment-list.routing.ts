import { Routes, RouterModule } from '@angular/router';
import { AddEditAssignmentComponent } from './add-edit-assignment/add-edit-assignment.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'add-assignment', component: AddEditAssignmentComponent },
  { path: 'edit-assignment/:assignmentId', component: AddEditAssignmentComponent } 
];

export const routing = RouterModule.forChild(childRoutes);
