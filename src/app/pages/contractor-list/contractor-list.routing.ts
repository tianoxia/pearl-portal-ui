import { Routes, RouterModule } from '@angular/router';
import { AddEditContractorComponent } from './add-edit-contractor/add-edit-contractor.component';
import { AuthGuard } from '../../_helpers';

const childRoutes: Routes = [
  { path: 'add-contractor', component: AddEditContractorComponent },
  { path: 'edit-contractor/:contractorId', component: AddEditContractorComponent } 
];

export const routing = RouterModule.forChild(childRoutes);
