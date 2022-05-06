import { Routes, RouterModule } from '@angular/router';
import { AddEditInvoiceGroupComponent } from './add-edit-invoice-group/add-edit-invoice-group.component';

const childRoutes: Routes = [
  { path: 'add-invoice-group/:clientId', component: AddEditInvoiceGroupComponent },
  { path: 'edit-invoice-group/:invoiceGroupId/:clientId', component: AddEditInvoiceGroupComponent }
];

export const routing = RouterModule.forChild(childRoutes);
