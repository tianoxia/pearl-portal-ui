import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AccountService, DataService, AlertService } from '../../../_services';
import { AccountProfile, PhoneType, ContactPhone, ErrorDetails } from '../../../_models';
import { states } from '../../../constants/states';
import { FormatPhonePipe } from 'app/shared/pipes/format-phone.pipe';
import { FormatZipCodePipe } from 'app/shared/pipes/format-zip-code.pipe';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss'],
  providers: [NgbActiveModal]
})
export class AccountProfileComponent implements OnInit {

  @ViewChild('name', { static: false }) nameRef: ElementRef;
  @ViewChild('divAddress', { static: false }) addressRef: ElementRef;
  @ViewChild('phones', { static: false }) phonesRef: ElementRef;
  @ViewChild('firstName', { static: false }) firstNameRef: ElementRef;
  @ViewChild('streetNumber', { static: false }) streetNumberRef: ElementRef;
  @ViewChild('phoneTypeOne', { static: false }) phoneTypeOneRef: ElementRef;

  profileForm: FormGroup;
  memberNumber: number;
  accountNumber: number;
  accountInfoWarningText: string;
  allowNameUpdate: boolean;
  allowAddressUpdate: boolean;
  allowPhoneUpdate: boolean;
  accountProfileResponse: AccountProfile;
  phoneTypes: Array<PhoneType>;
  states = states;
  fullName: string;
  address: string;
  phoneNumbers = '';
  isEditMode = false;
  submitted = false;
  editName = false;
  editAddress = false;
  editPhone = false;
  updateSuccessMessage: string;
  phoneRegex = /^(\()[1-9]\d{2}(\))(\s)[1-9]{1}\d{2}(-)\d{4}$/;
  accountsCount: number;
  configInfoKeys: string[] = ['ALLOW_NAME_UPDATE',
    'ALLOW_ADDRESS_UPDATE',
    'ALLOW_PHONE_UPDATE',
    'ACCOUNT_INFO_UPDATE_MESSAGE'
  ];
  webContentKeys: string[] = ['ACCOUNTINFOUPDATESUCCESS'];
  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private formatPhonePipe: FormatPhonePipe,
    private formatZipCodePipe: FormatZipCodePipe,
    private dataService: DataService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private renderer: Renderer2,
    private spinner: NgxSpinnerService) {
    const loginResponse = JSON.parse(localStorage.getItem('currentUser'));
    this.memberNumber = loginResponse.memberNumber.toString();
  }

  ngOnInit() {
    this.spinner.show();
    this.setupFormControls();
    this.getData();
    this.setValidationsOnFormChange();
  }

  
  private setValidationsOnFormChange() {
    this.profileForm.valueChanges.subscribe(value => {
      if (value.phones.phoneTypeTwo.length === 0 && value.phones.phoneNumberTwo.length > 0) {
        this.profileForm.get('phones.phoneTypeTwo').setErrors({ required: true });
      } else {
        this.profileForm.get('phones.phoneTypeTwo').setErrors(null);
      }
      if (value.phones.phoneTypeThree.length === 0 && value.phones.phoneNumberThree.length > 0) {
        this.profileForm.get('phones.phoneTypeThree').setErrors({ required: true });
      } else {
        this.profileForm.get('phones.phoneTypeThree').setErrors(null);
      }
    });
  }

  private getData() {
    this.accountService.getAccountProfileData(this.accountNumber.toString(), this.memberNumber.toString())
      .subscribe((response: AccountProfile) => {
        this.accountProfileResponse = response;
        this.accountsCount = this.accountProfileResponse.count;
        this.setViewModeText();
        this.setFormValues();
        this.spinner.hide();
      });
  }

  get f() { return this.profileForm; }

  private setupFormControls() {
    const zipCodeRegex = /^[0-9]{5}(?:-[0-9]{4})?$/;

    this.profileForm = this.formBuilder.group({
      name: this.formBuilder.group({
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['']
      }),
      address: this.formBuilder.group({
        streetNumber: ['', Validators.required],
        streetName: ['', Validators.required],
        streetType: [''],
        unit: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', [Validators.required, Validators.pattern(zipCodeRegex)]]
      }),
      updateIndicator: ['ONE'],
      phones: this.formBuilder.group({
        ecomDetailIdOne: [0],
        phoneTypeOne: [''],
        phoneNumberOne: ['', Validators.pattern(this.phoneRegex)],
        extensionOne: [''],
        deletePhoneOne: [false],
        ecomDetailIdTwo: [0],
        phoneTypeTwo: [''],
        phoneNumberTwo: ['', Validators.pattern(this.phoneRegex)],
        extensionTwo: [''],
        deletePhoneTwo: [false],
        ecomDetailIdThree: [0],
        phoneTypeThree: [''],
        phoneNumberThree: ['', Validators.pattern(this.phoneRegex)],
        extensionThree: [''],
        deletePhoneThree: [false]
      })
    });
  }

  private setViewModeText() {
    this.phoneTypes = this.accountProfileResponse.phoneTypes;
    this.fullName = (this.accountProfileResponse.firstName !== null ? this.accountProfileResponse.firstName : '') +
      ' ' + (this.accountProfileResponse.middleName !== null ? this.accountProfileResponse.middleName : '') +
      ' ' + (this.accountProfileResponse.lastName !== null ? this.accountProfileResponse.lastName : '');
    this.address = (this.accountProfileResponse.streetNumber !== null ? this.accountProfileResponse.streetNumber : '') +
      ' ' + (this.accountProfileResponse.streetName !== null ? this.accountProfileResponse.streetName : '') +
      ' ' + (this.accountProfileResponse.streetType !== null ? this.accountProfileResponse.streetType : '') +
      ' ' + (this.accountProfileResponse.unit !== null ? this.accountProfileResponse.unit : '') +
      '\n' + (this.accountProfileResponse.city !== null ? this.accountProfileResponse.city : '') +
      ', ' + (this.accountProfileResponse.state !== null ? this.accountProfileResponse.state : '') +
      ' ' + this.formatZipCodePipe.transform(this.accountProfileResponse.zip);
    const contactPhones = this.accountProfileResponse.contactPhones;
    this.phoneNumbers = '';
    for (const contactPhone of contactPhones) {
      const description = this.phoneTypes.find(x => x.eCommunicationId === contactPhone.eCommunicationId).description;
      const phoneNumber = contactPhone.phoneNumber;
      this.phoneNumbers += description + ' : ' + this.formatPhonePipe.transform(phoneNumber.toString()) + '\n';
    }

  }

  private setFormValues() {
    this.setNameControlValues();
    this.setAddressControlValues();
    this.setPhoneControlValues();
  }

  private resetForm() {
    this.resetNameControls();
    this.resetAddressControls();
    this.resetPhoneControls();
  }

  private setNameControlValues() {
    this.profileForm.patchValue({
      name: {
        firstName: this.accountProfileResponse.firstName,
        middleName: this.accountProfileResponse.middleName,
        lastName: this.accountProfileResponse.lastName
      }
    });
  }

  private setPhoneControlValues() {
    for (let index = 0; index < 3; index++) {
      const suffix = index === 0 ? 'One' : index === 1 ? 'Two' : 'Three';
      if (this.accountProfileResponse.contactPhones.length > index) {
        this.profileForm.get('phones.ecomDetailId' + suffix)
          .patchValue(this.accountProfileResponse.contactPhones[index].eCommunicationDetailId);
        this.profileForm.get('phones.phoneType' + suffix)
          .patchValue(this.accountProfileResponse.contactPhones[index].eCommunicationId);
        this.profileForm.get('phones.phoneNumber' + suffix)
          .patchValue(this.formatPhonePipe.transform(this.accountProfileResponse.contactPhones[index].phoneNumber.toString()));
        this.profileForm.get('phones.deletePhone' + suffix)
          .patchValue(this.accountProfileResponse.contactPhones[index].isDelete);
      } else {
        this.profileForm.get('phones.phoneType' + suffix)
          .patchValue('');
        this.profileForm.get('phones.phoneNumber' + suffix)
          .patchValue('');
        this.profileForm.get('phones.deletePhone' + suffix)
          .patchValue(false);
        this.undoDeletePhone(suffix);
      }
    }
  }

  private setAddressControlValues() {
    this.profileForm.patchValue({
      address: {
        streetNumber: this.accountProfileResponse.streetNumber,
        streetName: this.accountProfileResponse.streetName,
        streetType: this.accountProfileResponse.streetType,
        unit: this.accountProfileResponse.unit,
        city: this.accountProfileResponse.city,
        state: this.accountProfileResponse.state,
        zip: this.formatZipCodePipe.transform(this.accountProfileResponse.zip)
      }
    });
  }

  validateName() {
    this.submitted = true;
    const invalidElements = this.nameRef.nativeElement.querySelectorAll('.ng-invalid');
    if (invalidElements.length > 0) {
      invalidElements[0].focus();
    } else {
      this.submit();
    }
  }

  validateAddress() {
    this.submitted = true;
    const invalidElements = this.addressRef.nativeElement.querySelectorAll('.ng-invalid');
    if (invalidElements.length > 0) {
      invalidElements[0].focus();
      return false;
    }
    return true;
  }

  validatePhones() {
    this.submitted = true;
    const invalidElements = this.phonesRef.nativeElement.querySelectorAll('.ng-invalid');
    if (invalidElements.length > 0) {
      invalidElements[0].focus();
    } else {
      this.submit();
    }
  }

  submit() {
    this.submitted = true;
    this.alertService.clear();
    this.spinner.show();
    const request = this.setAccountProfileRequest();
    this.accountService.updateAccountProfileData(request)
      .subscribe(result => {
        this.isEditMode = false;
        this.getData();
        this.resetForm();
        this.submitted = false;
        this.alertService.success(this.updateSuccessMessage);
      },
        error => {
          this.spinner.hide();
          this.submitted = false;
          const errorDetails = error.error as ErrorDetails;
          if (errorDetails !== null) {
            this.alertService.error(errorDetails.message);
          } else {
            this.alertService.error(error.message);
          }
        });
  }

  private setAccountProfileRequest() {
    const request = new AccountProfile();
    request.memberNumber = this.memberNumber;
    request.accountNumber = this.accountNumber;
    request.firstName = this.profileForm.controls.name.value.firstName;
    request.middleName = this.profileForm.controls.name.value.middleName;
    request.lastName = this.profileForm.controls.name.value.lastName;
    request.streetNumber = this.profileForm.controls.address.value.streetNumber;
    request.streetName = this.profileForm.controls.address.value.streetName;
    request.streetType = this.profileForm.controls.address.value.streetType;
    request.unit = this.profileForm.controls.address.value.unit;
    request.city = this.profileForm.controls.address.value.city;
    request.state = this.profileForm.controls.address.value.state;
    request.zip = this.profileForm.controls.address.value.zip.toString().replace('-', '');
    request.updateIndicator = this.profileForm.controls.updateIndicator.value;
    request.contactPhones = new Array<ContactPhone>(3);
    for (let index = 0; index < request.contactPhones.length; index++) {
      const suffix = index === 0 ? 'One' : index === 1 ? 'Two' : 'Three';
      const ecomDetailId = this.profileForm.get('phones.ecomDetailId' + suffix).value;
      const phoneNumber = this.formatPhonePipe.untransform(this.profileForm.get('phones.phoneNumber' + suffix).value);
      const phoneType = this.phoneTypes
        .find(x => x.eCommunicationId === +this.profileForm.get('phones.phoneType' + suffix).value);
      if (ecomDetailId !== 0 || (ecomDetailId === 0 && phoneNumber.length === 10)) {
        request.contactPhones[index] = new ContactPhone();
        request.contactPhones[index].eCommunicationDetailId = ecomDetailId;
        request.contactPhones[index].eCommunicationId = this.profileForm.get('phones.phoneType' + suffix).value;
        request.contactPhones[index].eCommunicationDescription = phoneType ? phoneType.description : '';
        request.contactPhones[index].phoneNumber = +phoneNumber;
        request.contactPhones[index].extension = this.profileForm.get('phones.extension' + suffix).value;
        request.contactPhones[index].isDelete = this.profileForm.get('phones.deletePhone' + suffix).value;
      }
    }
    return request;
  }

  formatZipCode(control) {
    this.profileForm.patchValue({ address: { zip: this.formatZipCodePipe.transform(control.target.value) } });
  }

  onPhoneTypeChange(control, index) {
    const suffix = index === 2 ? 'Two' : 'Three';
    if (control.target.value.length > 0) {
      this.profileForm.get('phones.phoneNumber' + suffix).setValidators(
        [
          Validators.required,
          Validators.pattern(this.phoneRegex)
        ]);
    } else {
      this.profileForm.get('phones.phoneNumber' + suffix).clearValidators();
    }
    this.profileForm.get('phones.phoneNumber' + suffix).updateValueAndValidity();
  }

  editNameControls() {
    this.editName = true;
    this.renderer.setStyle(this.nameRef.nativeElement, 'display', 'block');
    this.resetAddressControls();
    this.resetPhoneControls();
    this.firstNameRef.nativeElement.focus();
  }

  resetNameControls() {
    this.editName = false;
    this.renderer.setStyle(this.nameRef.nativeElement, 'display', 'none');
    this.setNameControlValues();
  }

  editAddressControls() {
    this.editAddress = true;
    this.renderer.setStyle(this.addressRef.nativeElement, 'display', 'block');
    this.resetNameControls();
    this.resetPhoneControls();
    this.streetNumberRef.nativeElement.focus();
  }

  resetAddressControls() {
    this.editAddress = false;
    this.renderer.setStyle(this.addressRef.nativeElement, 'display', 'none');
    this.setAddressControlValues();
  }

  editPhoneControls() {
    this.editPhone = true;
    this.renderer.setStyle(this.phonesRef.nativeElement, 'display', 'block');
    this.resetAddressControls();
    this.resetNameControls();
    this.phoneTypeOneRef.nativeElement.focus();
  }

  resetPhoneControls() {
    this.editPhone = false;
    this.renderer.setStyle(this.phonesRef.nativeElement, 'display', 'none');
    this.setPhoneControlValues();
  }

  openConfirmationBox(content) {
    if (this.validateAddress()) {
      if (this.accountsCount > 0) {
        this.modalService.open(content, { backdrop: 'static', size: 'lg', centered: true });
      } else {
        this.submit();
      }
    }
  }

  deletePhone(suffix) {
    this.renderer.setStyle(document.getElementById('phoneType' + suffix), 'text-decoration', 'line-through');
    this.renderer.setStyle(document.getElementById('phoneNumber' + suffix), 'text-decoration', 'line-through');
    this.renderer.setStyle(document.getElementById('deleteIcon' + suffix), 'display', 'none');
    this.renderer.setStyle(document.getElementById('undoDeleteIcon' + suffix), 'display', 'block');
    this.profileForm.get('phones.deletePhone' + suffix)
      .patchValue(true);
  }

  undoDeletePhone(suffix) {
    this.renderer.setStyle(document.getElementById('phoneType' + suffix), 'text-decoration', '');
    this.renderer.setStyle(document.getElementById('phoneNumber' + suffix), 'text-decoration', '');
    this.renderer.setStyle(document.getElementById('deleteIcon' + suffix), 'display', 'block');
    this.renderer.setStyle(document.getElementById('undoDeleteIcon' + suffix), 'display', 'none');
    this.profileForm.get('phones.deletePhone' + suffix)
      .patchValue(false);
  }
}
