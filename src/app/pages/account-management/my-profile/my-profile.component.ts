import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AlertService, DataService } from 'app/_services';
import {
  MemberDetailsResponse, SecretQuestions,
  AccountDetails, MemberDetailsRequest, PaperlessAccount,
  RoundUpAccount, IApiResponse
} from 'app/_models';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  loginForm: FormGroup;
  paperlessForm: FormGroup;
  operationRoundupForm: FormGroup;
  @ViewChild('tabset', { static: true }) tabset: NgbTabset;
  memberDetails: MemberDetailsResponse;
  accounts: AccountDetails[];
  submitted = false;
  showPaymentConfirmationEmail = false;
  showServiceRequestConfirmationEmail = false;
  showUnlistedPhone = false;
  paperlessMemberLevel = false;
  paperlessAccountLevel = false;
  showPaperlessOther = false;
  showAnnualMeetingNotice = false;
  showOperationRoundUp = false;
  hasAccessToOperationRoundUp = false;
  hasAccessToOperationRoundUpPlus = false;
  allEmailChecked = false;
  allPaperlessBillChecked = false;
  allPaperlessOtherChecked = false;
  allOpRoundupChecked = false;
  showSecAnswer = false;
  showPassword = false;
  showConfirmPassword = false;
  annualMeetingNoticeLabel: string;
  showMarketingEmail = false;
  marketingEmailLabel: string;
  paperlessConfirmText: string;
  memberNumber: number;
  accountNumber: number;
  updateSuccessMessage: string;
  secQuestions: SecretQuestions[];
  configSettingsKeys: string[] = [
    'SEND_EBPP_PAYMENT_EMAIL',
    'SEND_OPEN_ACCESS_SERVICEORDER_EMAIL',
    'ALLOW_STORED_CC_INFO',
    'ALLOW_STORED_CHECK_INFO',
    'ALLOW_FLAG_UNLISTED_PHONE',
    'REGISTER_PAPERLESS_BILL_OPTION_MEMLEVEL',
    'REGISTER_PAPERLESS_BILL_OPTION_ACCTLEVEL',
    'REGISTER_PAPERLESS_OTHER_OPTION',
    'DISPLAY_ANNMTG_ELEC_KIT_YN',
    'ANNMTG_ELEC_KIT_TEXT',
    'DISPLAY_MKT_EMAIL_SIGNUP',
    'PAPERLESS_CONFIRMATION_TEXT',
    'PARTICIPATE_OPENACCESS',
    'PARTICIPATE',
    'PLUSPARTICIPATE'
  ];

  webContentKeys: string[] = [
    'MKT_EMAIL_SIGNUP_TEXT',
    'ACCOUNTINFOUPDATESUCCESS'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private changeDetector: ChangeDetectorRef,
    private dataService: DataService,
    private currencyPipe: CurrencyPipe) {
    const loginResponse = JSON.parse(localStorage.getItem('currentUser'));
    this.memberNumber = loginResponse.memberNumber.toString();
  }

  get paperlessAccountsArray() { return this.paperlessForm.controls.paperlessAccounts as FormArray; }
  get paperlessAccountsGroups() { return this.paperlessAccountsArray.controls as FormGroup[]; }
  get opFormArray() { return this.operationRoundupForm.controls.opRoundUpAccounts as FormArray; }
  get opFormArrayGroups() { return this.opFormArray.controls as FormGroup[]; }
  get f() { return this.loginForm.controls; }
  get p() { return this.paperlessForm.controls; }
  get o() { return this.operationRoundupForm.controls; }

  ngOnInit() {
    this.spinner.show();
    this.setupLoginFormControls();
    this.setupPaperlessFormControls();
    this.operationRoundupForm = this.formBuilder.group({
      opRoundUpAccounts: this.formBuilder.array([])
    });
    this.alertService.clear();

  }

  private setPaperlessFormValues() {
    if (this.paperlessAccountLevel) {
      for (const account of this.accounts) {
        this.paperlessAccountsArray.push(this.formBuilder.group({
          accountNumber: [account.accountNumber],
          email: [account.hasEmailBillNotice],
          paperlessBill: [account.hasPaperlessBilling],
          paperlessOther: [account.hasOtherPaperlessBillinge]
        }));
      }
    }
    let count = 0;
    this.paperlessAccountsGroups.filter((g, i, gs) => {
      if (gs[i].controls.email.value === true ||
        gs[i].controls.paperlessBill.value === true ||
        gs[i].controls.paperlessOther.value === true) {
        count++;
      }
    });
    this.paperlessForm.patchValue({
      hasOptedForPaperlessBilling: this.memberDetails.hasPaperlessBilling,
      hasOptedForPaperlessOther: this.memberDetails.hasPaperlessOther,
      allowAnnualMeetingNotice: this.memberDetails.electronicKit,
      allowMarketingEmails: this.memberDetails.marketingEmail,
      paperlessConfirmText: count > 0 ? true : false
    });
  }

  private setLoginFormValues() {
    this.loginForm.patchValue({
      email: this.memberDetails.userName,
      secQuestion: this.memberDetails.secretQuestionId,
      secAnswer: this.memberDetails.secretQuestionAnswer,
      paymentConfirmationEmail: this.memberDetails.paymentEmailReceived,
      serviceRequestConfirmationEmail: this.memberDetails.serviceOrderEmailReceived,
      unlistedPhone: this.memberDetails.phoneNumberMask,
    });
  }

  private setupPaperlessFormControls() {
    this.paperlessForm = this.formBuilder.group({
      hasOptedForPaperlessBilling: [''],
      hasOptedForPaperlessOther: [''],
      allowAnnualMeetingNotice: [''],
      allowMarketingEmails: [''],
      paperlessConfirmText: ['', Validators.requiredTrue],
      paperlessAccounts: this.formBuilder.array([])
    });
  }

  private setupLoginFormControls() {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      secQuestion: ['', Validators.required],
      secAnswer: ['', Validators.required],
      password: [''],
      cnfpassword: [''],
      paymentConfirmationEmail: [''],
      serviceRequestConfirmationEmail: [''],
      unlistedPhone: ['']
    });
  }

  onPasswordChange() {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    const password = this.loginForm.controls.password;
    const cnfPassword = this.loginForm.controls.cnfpassword;
    if (password.value.length > 0 || cnfPassword.value.length > 0) {
      password.setValidators([Validators.required, Validators.pattern(strongPasswordRegex)]);
      cnfPassword.setValidators(Validators.required);
    } else {
      password.clearValidators();
      cnfPassword.clearValidators();
    }
    if (cnfPassword.value.length === 0 && password.value.length > 0) {
      cnfPassword.setErrors({ required: true });
    } else if (password.value !== cnfPassword.value) {
      cnfPassword.setErrors({ notEqual: true });
    } else {
      cnfPassword.setErrors(null);
    }
    password.updateValueAndValidity();
  }

  checkAllPaperlessAccounts(event) {
    const name = event.target.name;
    const checked = event.target.checked;
    for (const index of this.paperlessAccountsGroups.keys()) {
      this.checkPaperlessAccount(checked, index, name);

    }
  }

  checkPaperlessAccount(checked, index, name) {
    const element = this.paperlessAccountsGroups[index];
    switch (name) {
      case 'email':
        element.patchValue({
          email: checked
        });
        break;
      case 'paperlessBill':
        element.patchValue({
          paperlessBill: checked
        });
        break;
      case 'paperlessOther':
        element.patchValue({
          paperlessOther: checked
        });
        break;
    }
    element.updateValueAndValidity();
    this.checkAllCheckbox(name);
  }

  private checkAllCheckbox(name: string) {
    let count = 0;
    this.paperlessAccountsGroups.filter((g, i, gs) => {
      if (gs[i].controls[name].value === true) {
        count++;
      }
    });
    switch (name) {
      case 'email':
        this.allEmailChecked = this.paperlessAccountsGroups.length === count ? true : false;
        break;
      case 'paperlessBill':
        this.allPaperlessBillChecked = this.paperlessAccountsGroups.length === count ? true : false;
        break;
      case 'paperlessOther':
        this.allPaperlessOtherChecked = this.paperlessAccountsGroups.length === count ? true : false;
        break;
    }

  }
  checkAllOpRoundupAccounts(event) {
    const checked = event.target.checked;
    this.allOpRoundupChecked = checked;
    this.opFormArrayGroups.every(group => group.patchValue({ optedForOp: checked }));
  }

  submit() {
    this.submitted = true;
    this.alertService.clear();
    if (this.validateLoginDetails()) {
      if (this.validatePaperlessSettings()) {
        if (this.validateOperationRoundUp()) {
          this.spinner.show();
          this.spinner.hide();
        } else {
          this.setFocusOnFirstErrorField();
          return;
        }
      } else {
        this.setFocusOnFirstErrorField();
        return;
      }
    } else {
      this.setFocusOnFirstErrorField();
      return;
    }
  }

  private setFocusOnFirstErrorField() {
    const invalidFields = [].slice.call(document.getElementsByClassName('ng-invalid'));
    invalidFields[1].focus();
  }

  validateLoginDetails() {
    if (this.loginForm.invalid) {
      this.tabset.select('tab-login');
      this.changeDetector.detectChanges();
      return false;
    }
    return true;
  }
  validatePaperlessSettings() {
    if (this.paperlessForm.invalid) {
      this.tabset.select('tab-paperless');
      this.changeDetector.detectChanges();
      return false;
    }
    return true;
  }
  validateOperationRoundUp() {
    if (this.operationRoundupForm.invalid) {
      this.tabset.select('tab-opertaion-roundup');
      this.changeDetector.detectChanges();
      return false;
    }
    return true;
  }

  setMemberDetailsRequest() {
    const request = new MemberDetailsRequest();
    request.memberNumber = this.memberNumber;
    request.userName = this.loginForm.controls.email.value;
    request.password = this.loginForm.controls.password.value;
    request.securityQuestionId = this.loginForm.controls.secQuestion.value;
    request.securityQuestionAnswer = this.loginForm.controls.secAnswer.value;
    request.removeStoredCreditData = false;
    request.removeStoredBankData = false;
    request.receiveServiceOrderEmail = this.loginForm.controls.serviceRequestConfirmationEmail.value;
    request.receivePaymentEmail = this.loginForm.controls.paymentConfirmationEmail.value;
    request.canMaskPhone = this.loginForm.controls.unlistedPhone.value;
    request.isPaperlessBilling = this.paperlessForm.controls.hasOptedForPaperlessBilling.value;
    request.isPaperlessOther = this.paperlessForm.controls.hasOptedForPaperlessOther.value;
    request.annualMarketingElectricKit = this.paperlessForm.controls.allowAnnualMeetingNotice.value;
    request.isMarketEmail = this.paperlessForm.controls.allowMarketingEmails.value;
    if (this.paperlessAccountLevel) {
      request.paperlessAccounts = new Array<PaperlessAccount>(this.paperlessAccountsGroups.length);
      for (let index = 0; index < this.paperlessAccountsGroups.length; index++) {
        request.paperlessAccounts[index] = new PaperlessAccount();
        const element = this.paperlessAccountsGroups[index];
        request.paperlessAccounts[index].accountNumber = element.controls.accountNumber.value;
        request.paperlessAccounts[index].isEmail = element.controls.email.value;
        request.paperlessAccounts[index].isPaperless = element.controls.paperlessBill.value;
        request.paperlessAccounts[index].isPaperlessOther = element.controls.paperlessOther.value;
      }
    }
    if (this.showOperationRoundUp) {
      request.roundupAccounts = new Array<RoundUpAccount>(this.opFormArrayGroups.length);
      for (let index = 0; index < this.opFormArrayGroups.length; index++) {
        request.roundupAccounts[index] = new RoundUpAccount();
        const element = this.opFormArrayGroups[index];
        request.roundupAccounts[index].accountNumber = element.controls.accountNumber.value;
        request.roundupAccounts[index].isRoundup = element.controls.optedForOp.value;
        request.roundupAccounts[index].amount = element.controls.opPlusAmount.value.replace('$', '').replace(',', '');
        request.roundupAccounts[index].expiration = element.controls.opPlusExpirationDate.value;
      }
    }
    console.log(request);
    return request;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode === 46) {
      return true;
    }
    return false;

  }

  formatToAmount(event) {
    const value = event.target.value.replace('$', '');
    if (!isNaN(+value)) {
      event.target.value = this.currencyPipe.transform(value);
    }
  }

  getTomorrow(): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}
