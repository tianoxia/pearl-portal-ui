import { Routes, RouterModule } from '@angular/router';
import { AddEditAssignmentComponent } from './add-edit-client-assignment/add-edit-client-assignment.component';
import { ViewAssignmentComponent } from './view-client-assignment/view-client-assignment.component';

const childRoutes: Routes = [
  { path: 'add-client-assignment/:clientId', component: AddEditAssignmentComponent },
  { path: 'edit-client-assignment/:assignmentId/:clientId', component: AddEditAssignmentComponent },
  { path: 'view-client-assignment/:assignmentId/:clientId', component: ViewAssignmentComponent }
];

export const routing = RouterModule.forChild(childRoutes);
