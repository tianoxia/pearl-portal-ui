import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';
import { RegistrationService, AlertService } from 'app/_services';
import { NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IApiResponse, ErrorDetails } from 'app/_models';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {
  headerText: string;
  @ViewChild('email', { static: false }) emailRef: ElementRef;
  @ViewChild('securityAnswer', { static: false }) securityAnswerRef: ElementRef;

  forgotPasswordForm: FormGroup;
  showForm = true;
  submitted = false;

  constructor(
    private resgiterService: RegistrationService,
    private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) { }


  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  ngAfterViewInit() {
    this.emailRef.nativeElement.focus();
  }

  get f() { return this.forgotPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (!this.forgotPasswordForm.valid) {
      return;
    }
    this.spinner.show();
    this.alertService.clear();
    
      this.resgiterService.validateEmail(this.forgotPasswordForm.value.email)
        .subscribe(
          (data: string) => {
            this.submitted = false;
            this.headerText = 'Reset Password';
            this.changeDetectorRef.detectChanges();
            this.forgotPasswordForm.get('email').disable({ onlySelf: true });
            this.spinner.hide();
          },
          error => {
            const errorDetails = JSON.parse(error.error) as ErrorDetails;
            if (errorDetails !== null) {
              this.alertService.error(errorDetails[0].message);
            } else {
              this.alertService.error(error);
            }
            this.spinner.hide();
            this.submitted = false;
          });
  }
}
