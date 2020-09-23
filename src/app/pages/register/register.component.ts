import { Component, OnInit, Renderer2, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { RegistrationService, AlertService } from 'app/_services';
import { ErrorDetails, SecretQuestions, RegisterUser, IApiResponse } from 'app/_models';
import { NgxSpinnerService } from 'ngx-spinner';

const STEP_ONE_PARAMS = {
  accountNumber: 'accountNumber',
  controlNumber: 'controlNumber',
  email: 'email',
  cnfemail: 'cnfemail'
};

const STEP_TWO_PARAMS = {
  password: 'password',
  cnfpassword: 'cnfpassword',
  secQuestion: 'secQuestion',
  secAnswer: 'secAnswer'
};

const EDIT_MESSAGES = {
  ACCTSTATEMENTBAD: 'Invalid Statement Id.',
  ACCTSSNDIGITSBAD: 'Invalid SSN Digits.',
  NOACTIVEACCTS: 'No Active Accounts.',
  ACCTMEMBAD: 'Invalid Member Number.',
  INVALIDEMAIL: 'Invalid Email.'
};


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {

  @ViewChild('password', { static: false }) passwordRef: ElementRef;
  @ViewChild('cnfpassword', { static: false }) cnfpasswordRef: ElementRef;
  @ViewChild('stepOneForm', { static: false }) stepOneFormRef: ElementRef;
  @ViewChild('stepTwoForm', { static: false }) stepTwoFormRef: ElementRef;
  step1Form: FormGroup;
  step2Form: FormGroup;

  submitted = false;
  registerUser = true;
  registerMember = false;
  isSuccess = false;
  showConfirmEmail = false;
  showPaperlessBilling = false;
  showPaperlessOther = false;
  showMarketingEmail = false;
  isPaperlessBillingChecked = false;
  isPaperlessOtherChecked = false;
  showPassword = false;
  showConfirmPassword = false;
  memberNumber: string;
  username: string;
  statementIdLabel: string;
  paperlessConfirmText: string;
  marketingEmailLabel: string;
  regControlType: string;
  regSSNDigits: string;
  secQuestions: SecretQuestions[];

  constructor(
    private formBuilder: FormBuilder,
    private registrationService: RegistrationService,
    private alertService: AlertService,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService) {

  }

  ngAfterViewInit() {
    
  }

  ngOnInit() {
    //this.spinner.show();
    this.setupStepOneControls();
    this.setupStepTwoControls();
    this.setValidationsOnFormChange();
  }

  private setupStepOneControls() {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const numberRegex = /^[0-9]*$/;
    this.step1Form = this.formBuilder.group({
      [STEP_ONE_PARAMS.accountNumber]: ['', this.validators(numberRegex)],
      [STEP_ONE_PARAMS.controlNumber]: ['', this.validators(numberRegex)],
      [STEP_ONE_PARAMS.email]: ['', this.validators(emailRegex)],
      [STEP_ONE_PARAMS.cnfemail]: ['', this.validators(emailRegex)]
    });
  }

  private setupStepTwoControls() {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    this.step2Form = this.formBuilder.group({
      [STEP_TWO_PARAMS.password]: ['', this.validators(strongPasswordRegex)],
      [STEP_TWO_PARAMS.cnfpassword]: ['', Validators.required],
      [STEP_TWO_PARAMS.secQuestion]: ['', Validators.required],
      [STEP_TWO_PARAMS.secAnswer]: ['', Validators.required]
    });
  }

  private setValidationsOnFormChange() {
    
  }

  onControlNumberInputChange(control) {
    if (control.target.value.length > 0) {
      if (this.regControlType === 'SSNDIGITS' && control.target.value.length !== parseInt(this.regSSNDigits, 10)) {
        this.step1Form.get(STEP_ONE_PARAMS.controlNumber).setValidators(
          this.validators('^[0-9]*$').concat(
            Validators.minLength(parseInt(this.regSSNDigits, 10)),
            Validators.maxLength(parseInt(this.regSSNDigits, 10))
          ));
      } else {
        this.step1Form.get(STEP_ONE_PARAMS.controlNumber).setValidators(this.validators('^[0-9]*$'));
      }
      this.step1Form.get(STEP_ONE_PARAMS.controlNumber).updateValueAndValidity();
    }
  }
  
  get f() { return this.step1Form.controls; }
  get g() { return this.step2Form.controls; }

  submitUser() {
    this.submitted = true;
    this.alertService.clear();

    if (this.step1Form.invalid) {
      const invalidFields = [].slice.call(document.getElementsByClassName('ng-invalid'));
      invalidFields[1].focus();
      return;
    }
    this.spinner.show();
    this.registrationService.registerUser(this.step1Form.value)
      .pipe()
      .subscribe(
        response => {
          this.spinner.hide();
          this.setStepTwoFormValues(response);
          this.submitted = false;
          this.passwordRef.nativeElement.focus();
        },
        error => {
          this.spinner.hide();
          this.submitted = false;
          this.showErrorMessage(error);

        }
      );


  }

  private setStepTwoFormValues(response: RegisterUser) {
    this.username = this.step1Form.controls[STEP_ONE_PARAMS.email].value;
    this.step2Form.patchValue({ memberNumber: response.memberNumber });
    this.memberNumber = response.memberNumber;
    this.secQuestions = response.secretQuestions;
    this.registerUser = false;
    this.changeDetectorRef.detectChanges();
  }

  private showErrorMessage(error: any) {
    if (error.status === 400) {
      const errorDetails = error.error as ErrorDetails;
      if (errorDetails !== null) {
        this.alertService.error(errorDetails[0].message);
      } else {
        this.alertService.error('Bad Request. Please contact the Utility for further assistance.');
      }
    } else {
      this.alertService.error('Server Error has occured. Please contact the Utility for further assistance.');
    }
  }

  
  submitMember() {
    this.submitted = true;
    if (this.step2Form.invalid) {
      const invalidFields = this.stepTwoFormRef.nativeElement.querySelectorAll('.ng-invalid');
      if (invalidFields.length > 0) {
        invalidFields[0].focus();
        return;
      }
    }
    this.spinner.show();
    this.spinner.hide();
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validators(pattern): any {
    return [
      Validators.required,
      Validators.pattern(pattern)
    ];
  }
}
