import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { RegistrationService, AlertService } from 'app/_services';
import { ErrorDetails, IApiResponse } from 'app/_models';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  cipherLink: string;
  email: string;
  showForm = false;
  resetPasswordForm: FormGroup;
  isSuccess = false;
  showPassword = false;
  @ViewChild('password', { static: false }) passwordRef: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private registerService: RegistrationService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    const link = 'link';
    this.resetPasswordForm = this.formBuilder.group({
      email: [''],
      password: ['', [Validators.required, Validators.pattern(strongPasswordRegex)]]
    });

    this.route.queryParams.subscribe(params => {
      this.cipherLink = params[link];
      if (this.cipherLink) {
        this.spinner.show();
        this.registerService.validateResetPasswordUrl(this.cipherLink)
          .subscribe(
            (data: any) => {
              this.resetPasswordForm.patchValue({ email: data.email });
              this.resetPasswordForm.get('email').disable({ onlySelf: true });
              this.showForm = true;
              this.changeDetectorRef.detectChanges();
              this.spinner.hide();
              this.passwordRef.nativeElement.focus();
            },
            error => {
              if (error.status === 400) {
                const errorDetails = error.error as ErrorDetails;
                if (errorDetails !== null) {
                  this.alertService.error(errorDetails[0].message);
                }
              } else {
                this.alertService.error('Server Error has occured. Please contact the Utility for further assistance.');
              }
              this.spinner.hide();
            });
      } else {
        // navigate to page not found url.
      }
    });
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.resetPasswordForm.valid) {
      return;
    }
    this.spinner.show();
    this.alertService.clear();
    this.registerService.resetPassword(this.resetPasswordForm.getRawValue())
      .subscribe(
        (data: IApiResponse) => {
          if (data.code === 2011) {
            this.alertService.success(data.message);
            this.showForm = false;
            this.isSuccess = true;
          }
          this.spinner.hide();
        },
        error => {
          if (error.status === 400) {
            const errorDetails = error.error as ErrorDetails;
            if (errorDetails !== null) {
              this.alertService.error(errorDetails[0].message);
            }
          } else {
            this.alertService.error('Server Error has occured. Please contact the Utility for further assistance.');
          }
          this.spinner.hide();
        }
      );
  }
}
