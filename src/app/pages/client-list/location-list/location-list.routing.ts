import { Routes, RouterModule } from '@angular/router';
import { AddEditLocationComponent } from './add-edit-location/add-edit-location.component';

const childRoutes: Routes = [
  { path: 'add-location/:clientId', component: AddEditLocationComponent },
  { path: 'edit-location/:locationId/:clientId', component: AddEditLocationComponent }
];

export const routing = RouterModule.forChild(childRoutes);
