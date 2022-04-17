import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AddEditPayPeriodComponent } from './add-edit-pay-period/add-edit-pay-period.component';
import { AuthenticationService } from 'app/_services';
import { PermissionType, Resource } from 'app/_models';

@Component({
  selector: 'app-view-pay-periods',
  templateUrl: './view-pay-periods.component.html',
  styleUrls: ['./view-pay-periods.component.css']
})
export class ViewPayPeriodsComponent implements OnInit {

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthenticationService,
    private router: Router,
    private dialog: MatDialog) { }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.Reports && e.permissionTypes.includes(PermissionType.LIST))) {
        this.router.navigateByUrl("/unauthorized");
      }
    }
    window.scrollTo(0, 0);
    this.spinner.hide();
  }
  addPayPeriod() {
    const modalref = this.dialog.open(AddEditPayPeriodComponent, {
      panelClass: 'update-enddate-dialog',
      maxWidth: window.innerWidth < 600? '90vw' : '80vw',
      data: {
        payPeriodId: null,
        payDate: null,
        payFrequency: null
      }
    });
    return false;
  }
}
