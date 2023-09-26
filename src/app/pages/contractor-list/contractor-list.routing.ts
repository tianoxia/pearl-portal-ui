import { Routes, RouterModule } from '@angular/router';
import { AddEditContractorComponent } from './add-edit-contractor/add-edit-contractor.component';
import { ViewContractorComponent } from './view-contractor/view-contractor.component';

const childRoutes: Routes = [
  { path: 'add-contractor', component: AddEditContractorComponent },
  { path: 'edit-contractor/:contractorId', component: AddEditContractorComponent } ,
  { path: 'view-contractor/:contractorId', component: ViewContractorComponent }
];

export const routing = RouterModule.forChild(childRoutes);
