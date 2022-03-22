import { Routes, RouterModule } from '@angular/router';
import { AddEditEmployeeComponent } from './add-edit-employee/add-edit-employee.component';

const childRoutes: Routes = [
  { path: 'add-employee', component: AddEditEmployeeComponent },
  { path: 'edit-employee/:employeeId', component: AddEditEmployeeComponent } 
];

export const routing = RouterModule.forChild(childRoutes);
