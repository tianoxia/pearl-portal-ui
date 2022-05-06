import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { ProviderEmployeeService, AlertService, AuthenticationService } from 'app/_services';
import { MustMatch } from 'app/_helpers';
import { CustomValidator } from '../../../shared/validation';
import { ProviderEmployeeListResponse, ProviderEmployeeRequest, Recruiter, IApiResponse, CandidateSource } from 'app/_models';
import { states } from '../../../constants/states';
import { ServiceTypes } from 'app/constants/service-types';
import { employeeStatus } from 'app/constants/employee-status';

@Component({
  selector: 'app-add-edit-provider-employee',
  templateUrl: './add-edit-provider-employee.component.html',
  styleUrls: ['./add-edit-provider-employee.component.css']
})
export class AddEditProviderEmployeeComponent implements OnInit {
  @Input() providerEmployeeAddEditForm: FormGroup;
  providerEmployeeId: number;
  isAddMode: boolean;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  states = states;
  statuses = employeeStatus.filter(e => e !== 'All');
  action: string;
  serviceTypes = ServiceTypes;
  candSources: CandidateSource[];
  defaultCandSource: CandidateSource;
  providerEmployee: ProviderEmployeeListResponse;
  pwd_hide = true;
  cfm_pwd_hide = true;
  user: string;
  phoneRegex = /^(\()[1-9]\d{2}(\))(\s)[1-9]{1}\d{2}(-)\d{4}$/;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private providerEmployeeService: ProviderEmployeeService,
    private alertService: AlertService) {
      this.providerEmployee = new ProviderEmployeeListResponse();
    }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.providerEmployeeId = this.route.snapshot.params['providerEmployeeId'];
    this.isAddMode = !this.providerEmployeeId;
    const zipCodeRegex = /^(?!0{5})[0-9]{5}(?:-(?!0{4})[0-9]{4})?$/;
    this.defaultCandSource = new CandidateSource();
    this.defaultCandSource.candidateSourceId = null;
    this.defaultCandSource.sourceName = 'Select Candidate Source';
    this.providerEmployeeAddEditForm = this.formBuilder.group({
      employeeStatus: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      ssn: ['', [Validators.required, CustomValidator.ssnValidator]],
      emailAddress: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      address2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern(zipCodeRegex)]],
      password: ['', [this.isAddMode ? Validators.required : Validators.nullValidator]],
      confirmPassword: ['', this.isAddMode ? Validators.required : Validators.nullValidator],
      candidateSourceId: ['', Validators.required],
      phone: ['', Validators.required],
      cellPhone: [''],
      emergencyContact: [''],
      ecPhone: [''],
      serviceType: ['', Validators.required],
      isContractService: false
    } , {
        validator: MustMatch('password', 'confirmPassword')
    });
    const passwordValidators = [Validators.minLength(6)];
    if (this.isAddMode) {
      passwordValidators.push(Validators.required);
    }
    if (!this.isAddMode) {
        this.action = 'Edit';
        this.loadData();
    } else {
      this.action = 'Add';
      this.loadCandSources();
    }
  }

  private loadCandSources() {
    this.alertService.clear();
    this.providerEmployeeService.getAllCandidateSources()
      .subscribe(candidatesources => {
        this.candSources = candidatesources as CandidateSource[];
        this.candSources.splice(0, 0, this.defaultCandSource);
        this.providerEmployeeAddEditForm.get('candidateSourceId').patchValue(null);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  private loadData() {
    this.alertService.clear();
    forkJoin([this.providerEmployeeService.getProviderEmployeeById(this.providerEmployeeId), this.providerEmployeeService.getAllCandidateSources()])
      .subscribe(([providerEmployee, candidatesources]) => {
        this.providerEmployee = providerEmployee as ProviderEmployeeListResponse;
        this.providerEmployeeAddEditForm.patchValue(this.providerEmployee);
        this.candSources = candidatesources as CandidateSource[];
        this.candSources.splice(0, 0, this.defaultCandSource);
        this.providerEmployeeAddEditForm.get('candidateSourceId').patchValue(this.providerEmployee.candidateSourceId)
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.providerEmployeeAddEditForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.providerEmployeeAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createProviderEmployee();
    } else {
        this.updateProviderEmployee();
    }
  }

  private createProviderEmployee() {
    const request = this.setProviderEmployeeRequest() as ProviderEmployeeRequest;
    this.providerEmployeeService.createProviderEmployee(request)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.router.navigate(['provider-employee-list'], {queryParams: { message: response.message, action: this.action }});
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  private updateProviderEmployee() {
      const request = this.setProviderEmployeeRequest() as ProviderEmployeeRequest;
      this.providerEmployeeService.updateProviderEmployee(this.providerEmployeeId, request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.router.navigate(['provider-employee-list'], {queryParams: { message: response.message, action: this.action }});            
          },
          error => {
            window.scrollTo(0, 0);
            this.alertService.error(error);
            this.spinner.hide();
          });
  }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private setProviderEmployeeRequest(): ProviderEmployeeRequest {
    const request = new ProviderEmployeeRequest();
    request.employeeStatus = this.providerEmployeeAddEditForm.controls.employeeStatus.value;
    request.user = this.user;
    request.firstName = this.providerEmployeeAddEditForm.controls.firstName.value;
    request.lastName = this.providerEmployeeAddEditForm.controls.lastName.value;
    request.serviceType = this.providerEmployeeAddEditForm.controls.serviceType.value;
    request.isContractService = false;
    request.phone = this.providerEmployeeAddEditForm.controls.phone.value;
    request.cellPhone = this.providerEmployeeAddEditForm.controls.cellPhone.value;
    request.emergencyContact = this.providerEmployeeAddEditForm.controls.emergencyContact.value;
    request.ecPhone = this.providerEmployeeAddEditForm.controls.ecPhone.value;
    request.address = this.providerEmployeeAddEditForm.controls.address.value;
    request.address2 = this.providerEmployeeAddEditForm.controls.address2.value;
    request.city = this.providerEmployeeAddEditForm.controls.city.value;
    request.state = this.providerEmployeeAddEditForm.controls.state.value;
    request.zip = this.providerEmployeeAddEditForm.controls.zip.value;
    request.candidateSourceId = +this.providerEmployeeAddEditForm.controls.candidateSourceId.value;
    request.ssn = this.providerEmployeeAddEditForm.controls.ssn.value;
    request.emailAddress = this.providerEmployeeAddEditForm.controls.emailAddress.value;
    request.password = this.providerEmployeeAddEditForm.controls.password.value;
    return request;
  }

  public hasError = (controlName: string) => {
    return this.providerEmployeeAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'firstname': 
        this.providerEmployeeAddEditForm.controls.firstName.patchValue('');
        break;
      case 'lastname':
        this.providerEmployeeAddEditForm.controls.lastName.patchValue('');
        break;
      case 'ssn':
        this.providerEmployeeAddEditForm.controls.ssn.patchValue('');
        break;
      case 'emailAddress':
        this.providerEmployeeAddEditForm.controls.emailAddress.patchValue('');
        break;
      case 'address':
        this.providerEmployeeAddEditForm.controls.address.patchValue('');
        break;
      case 'address2':
        this.providerEmployeeAddEditForm.controls.address2.patchValue('');
        break;
      case 'city':
        this.providerEmployeeAddEditForm.controls.city.patchValue('');
        break;
      case 'state':
        this.providerEmployeeAddEditForm.controls.state.patchValue('');
        break;
      case 'zip':
        this.providerEmployeeAddEditForm.controls.zip.patchValue('');
        break;
      case 'phone':
        this.providerEmployeeAddEditForm.controls.phone.patchValue('');
        break;
      case 'cellPhone':
        this.providerEmployeeAddEditForm.controls.cellPhone.patchValue('');
        break;
      case 'emergencyContact':
        this.providerEmployeeAddEditForm.controls.emergencyContact.patchValue('');
        break;
      case 'ecPhone':
        this.providerEmployeeAddEditForm.controls.ecPhone.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'firstname': 
        if (this.providerEmployeeAddEditForm.controls.firstName.hasError('required')) {
          return 'First name is required';
        }
        break;
      case 'lastname':
        if (this.providerEmployeeAddEditForm.controls.lastName.hasError('required')) {
          return 'Last name is required';
        }
        break;
      case 'ssn':
        if (this.providerEmployeeAddEditForm.controls.ssn.hasError('required')) {
          return 'SSN is required';
        } else if (this.providerEmployeeAddEditForm.controls.ssn.hasError('invalidSsn')) {
          return 'SSN must be 9 numeric digits';
        }
        break;
      case 'emailAddress':
        if (this.providerEmployeeAddEditForm.controls.emailAddress.hasError('required')) {
          return 'Email address is required';
        } else if (this.providerEmployeeAddEditForm.controls.emailAddress.hasError('email')) {
          return 'Email must be a valid email address';
        }
        break;
      case 'address':
        if (this.providerEmployeeAddEditForm.controls.address.hasError('required')) {
          return 'Address is required';
        }
        break;
      case 'city':
        if (this.providerEmployeeAddEditForm.controls.city.hasError('required')) {
          return 'City is required';
        }
        break;
      case 'state':
        if (this.providerEmployeeAddEditForm.controls.state.hasError('required')) {
          return 'State is required';
        }
        break;
      case 'zip':
        if (this.providerEmployeeAddEditForm.controls.zip.hasError('required')) {
          return 'Zip is required';
        } else if (this.providerEmployeeAddEditForm.controls.zip.hasError('pattern')) {
          return 'Zip code must be a 5 or 9 digit number(Ex: 98745-4321).';
        }
        break;
      case 'password':
        if (this.providerEmployeeAddEditForm.controls.password.hasError('required')) {
          return 'Password is required';
        }
        break;
      case 'confirmPassword':
        if (this.providerEmployeeAddEditForm.controls.confirmPassword.hasError('required')) {
          return 'Confirm password is required';
        } else if (this.providerEmployeeAddEditForm.controls.confirmPassword.hasError('mustMatch')) {
          return 'Passwords must match';
        }
        break;
      case 'candidateSourceId':
        if (this.providerEmployeeAddEditForm.controls.candidateSourceId.hasError('required')) {
          return 'Candidate source is required';
        }
        break;
      case 'phone':
        if (this.providerEmployeeAddEditForm.controls.phone.hasError('required')) {
          return 'Phone is required';
        }
        break;
      case 'serviceType':
        if (this.providerEmployeeAddEditForm.controls.phone.hasError('required')) {
          return 'Service type is required';
        }
        break;
    }
  }
  compareServiceType(o1: any, o2: any) {
    return (o1 === o2);
  }
}
