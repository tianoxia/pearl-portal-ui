import { Routes, RouterModule } from '@angular/router';
import { AddEditClientComponent } from './add-edit-client/add-edit-client.component';
import { ViewClientComponent } from './view-client/view-client.component';

const childRoutes: Routes = [
  { path: 'add-client', component: AddEditClientComponent },
  { path: 'edit-client/:clientId', component: AddEditClientComponent },
  { path: 'view-client/:clientId', component: ViewClientComponent }
];

export const routing = RouterModule.forChild(childRoutes);
