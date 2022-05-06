import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService, AuthenticationService, DataService } from 'app/_services';
import { CurrentLoginRequest, IApiResponse } from 'app/_models';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  showForm = false;
  resetPasswordForm: FormGroup;
  isSuccess = false;
  loading = false;
  showPassword = false;
  showCurrentPassword = false;
  employeeName: string;
  employeeId: number;
  @ViewChild('password', { static: false }) passwordRef: ElementRef;
  message: string;
  showConfirmPassword = false;
  invalidResetPasswordUrl: boolean;
  constructor(
    private authService: AuthenticationService,
    private dataService: DataService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private formBuilder: FormBuilder) {
    const loginResponse = JSON.parse(localStorage.getItem('currentUser'));
    this.employeeName = loginResponse.employeeName;
    this.employeeId = loginResponse.employeeId;
  }

  ngOnInit() {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    this.resetPasswordForm = this.formBuilder.group({
      employeeId: this.employeeId,
      currentpassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(strongPasswordRegex)]],
      //password: ['', Validators.required],
      cnfpassword: ['', Validators.required]
    });
    this.showForm = true;
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (!this.resetPasswordForm.valid) {
      return;
    }
    this.loading = true;
    this.spinner.show();
    this.alertService.clear();
    this.dataService.resetPassword(this.resetPasswordForm.getRawValue())
      .subscribe(
        (data: IApiResponse) => {
          if (data.code === 2011) {
            this.message = data.message;
            this.showForm = false;
            this.isSuccess = true;
            this.authService.logout();
          }
          this.spinner.hide();
        },
        error => {
          this.alertService.error(error);
          this.spinner.hide();
        }
      );
  }

  onCurrentPasswordChange() {
    let userData = new CurrentLoginRequest();
    userData.employeeId = this.employeeId;
    userData.password= this.resetPasswordForm.controls.currentpassword.value;
    this.dataService.validateCurrentPassword(userData)
    .subscribe((result: boolean) => {
      if (result) {
        this.resetPasswordForm.controls.currentpassword.setErrors(null);
        //this.resetPasswordForm.setErrors({ invalid: false });
      } else {
        this.resetPasswordForm.controls.currentpassword.setErrors({ incorrect: true });
      }
      this.spinner.hide();
    },
    error => {
      this.alertService.error(error);
      this.loading = false;
      this.spinner.hide();
    });
  }

  disablePaste() {
    return false;
  }
}
