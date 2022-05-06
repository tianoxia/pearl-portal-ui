import { Routes, RouterModule } from '@angular/router';
import { AddEditProviderEmployeeComponent } from './add-edit-provider-employee/add-edit-provider-employee.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'add-provider-employee', component: AddEditProviderEmployeeComponent },
  { path: 'edit-provider-employee/:providerEmployeeId', component: AddEditProviderEmployeeComponent } 
];

export const routing = RouterModule.forChild(childRoutes);
