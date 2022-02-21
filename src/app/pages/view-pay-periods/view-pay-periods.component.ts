import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';

import { AddEditPayPeriodComponent } from './add-edit-pay-period/add-edit-pay-period.component';

@Component({
  selector: 'app-view-pay-periods',
  templateUrl: './view-pay-periods.component.html',
  styleUrls: ['./view-pay-periods.component.css']
})
export class ViewPayPeriodsComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService, private dialog: MatDialog) { }

  ngOnInit() {
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
