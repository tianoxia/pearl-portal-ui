import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { PayPeriodService, AlertService, AuthenticationService } from 'app/_services';
import { PayPeriodRequest, IApiResponse } from 'app/_models';

export interface PayPeriodDialogData {
  payPeriodId: number;
  payDate: Date;
  payFrequency: string;
  pageType: string;
}

@Component({
  selector: 'app-add-edit-pay-period',
  templateUrl: './add-edit-pay-period.component.html',
  styleUrls: ['./add-edit-pay-period.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddEditPayPeriodComponent implements OnInit {
  @Input() addEditPayPeriodForm: FormGroup;
  @ViewChild('successDialog', { static: true, read: TemplateRef }) warningRef: TemplateRef<any>;
  payPeriodId: number;
  payDate: Date;
  payFrequency: string;
  pageType: string;
  action: string;
  submitted = false;
  successMessage: string;
  isAddMode: boolean;
  user: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PayPeriodDialogData,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddEditPayPeriodComponent>,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private payPeriodService: PayPeriodService,
    private alertService: AlertService) {
      this.addEditPayPeriodForm = formBuilder.group({
        payDate: ['', [Validators.required]],
        payFrequency: ['', [Validators.required]]
      });
      this.payPeriodId = data.payPeriodId;
      this.payDate = data.payDate;
      this.payFrequency = data.payFrequency;
      this.pageType = data.pageType;
    }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
      if (this.payPeriodId) {
        this.isAddMode = false;
        this.action = 'Edit';
        this.addEditPayPeriodForm.controls.payDate.patchValue(this.payDate);
        this.addEditPayPeriodForm.controls.payFrequency.patchValue(this.payFrequency);
      } else {
        this.isAddMode = true;
        this.action = 'Add';
      }
    }
  }
  public hasError = (controlName: string) => {
    return this.addEditPayPeriodForm.controls[controlName].hasError;
  }
  setPayDateEvent(event: MatDatepickerInputEvent<Date>) {
    if (event.value.getDay() !== 5) {
      this.addEditPayPeriodForm.controls.payDate.setErrors({notFriday: true});
      return false;
    } else {
      this.addEditPayPeriodForm.controls.payDate.setErrors(null);
      return true;
    }
  }
  getErrorMessage(control: string) {
    switch (control) {
      case 'payFrequency':
        if (this.addEditPayPeriodForm.controls.payFrequency.hasError('required')) {
          return 'Pay frequency is required';
        }
        break;
      case 'payDate':
        if (this.addEditPayPeriodForm.controls.payDate.hasError('required')) {
          return 'Pay date is required';
        } else if (this.addEditPayPeriodForm.controls.payDate.hasError('notFriday')) {
          return 'Pay date must be a Friday date';
        }
        break;
    }
  }
  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.addEditPayPeriodForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createPayPeriod();
    } else {
        this.updatePayPeriod();
    }
  }
  private createPayPeriod() {
    const request = this.setPayPeriodRequest() as PayPeriodRequest;
      this.payPeriodService.createPayPeriod(request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.spinner.hide();
            this.successMessage = response.message;
            this.openSuccessDialog(this.warningRef);
          },
          error => {
            window.scrollTo(0, 0);
            this.alertService.error(error);
            this.spinner.hide();
          });
      //this.dialogRef.close();
  }
  private updatePayPeriod() {
    const request = this.setPayPeriodRequest() as PayPeriodRequest;
    this.payPeriodService.updatePayPeriod(this.payPeriodId, request)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.spinner.hide();
          this.successMessage = response.message;
          this.openSuccessDialog(this.warningRef);
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
        //this.dialogRef.close();
  }
  private setPayPeriodRequest(): PayPeriodRequest {
    const request = new PayPeriodRequest();
    request.payDate = this.addEditPayPeriodForm.controls.payDate.value;
	  request.payFrequency = this.addEditPayPeriodForm.controls.payFrequency.value;
    return request;
  }
  openSuccessDialog(warningDialog) {
    this.dialog.open(warningDialog, {
      autoFocus: true,
      maxWidth: window.innerWidth < 600? '90vw' : '80vw',
      disableClose: true
    });
  }
  close() {
    this.dialog.closeAll();
    if (this.payFrequency === 'W') {
      this.router.navigate(['view-pay-periods/pay-period-dashboard/weekly-pay-periods'],
      {queryParams: { pagetype: this.pageType}});
    } else {
      this.router.navigate(['view-pay-periods/pay-period-dashboard/biweekly-pay-periods'],
      {queryParams: { pagetype: this.pageType}});
    }
  }
}
