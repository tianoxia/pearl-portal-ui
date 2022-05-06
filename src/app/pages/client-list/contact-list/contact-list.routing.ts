import { Routes, RouterModule } from '@angular/router';
import { AddEditContactComponent } from './add-edit-contact/add-edit-contact.component';

const childRoutes: Routes = [
  { path: 'add-contact/:clientId', component: AddEditContactComponent },
  { path: 'edit-contact/:contactId/:clientId', component: AddEditContactComponent }
];

export const routing = RouterModule.forChild(childRoutes);
