import { Routes, RouterModule } from '@angular/router';
import { AddEditClientComponent } from './add-edit-client/add-edit-client.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'add-client', component: AddEditClientComponent },
  { path: 'edit-client/:clientId', component: AddEditClientComponent } 
];

export const routing = RouterModule.forChild(childRoutes);
