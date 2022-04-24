import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';

import { ContractorService, AlertService, AuthenticationService } from 'app/_services';
import { MustMatch } from 'app/_helpers';
import { CustomValidator } from '../../../shared/validation';
import { ContractorListResponse, ContractorRequest, Recruiter, IApiResponse, CandidateSource } from 'app/_models';
import { states } from '../../../constants/states';

@Component({
  selector: 'app-add-edit-contractor',
  templateUrl: './add-edit-contractor.component.html',
  styleUrls: ['./add-edit-contractor.component.css']
})
export class AddEditContractorComponent implements OnInit {
  @Input() contractorAddEditForm: FormGroup;
  contractorId: number;
  isAddMode: boolean;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  states = states;
  action: string;
  recruiters: Recruiter[];
  candSources: CandidateSource[];
  salesPersonList: Recruiter[];
  defaultRecruiter: Recruiter;
  defaultSalesPerson: Recruiter;
  defaultCandSource: CandidateSource;
  contractor: ContractorListResponse;
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
    private contractorService: ContractorService,
    private alertService: AlertService) {
      this.contractor = new ContractorListResponse();
    }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.contractorId = this.route.snapshot.params['contractorId'];
    this.isAddMode = !this.contractorId;
    const zipCodeRegex = /^(?!0{5})[0-9]{5}(?:-(?!0{4})[0-9]{4})?$/;
    this.defaultRecruiter = new Recruiter();
    this.defaultSalesPerson = new Recruiter();
    this.defaultCandSource = new CandidateSource();
    this.defaultRecruiter.firstName = 'Select Recruiter';
    this.defaultRecruiter.lastName = '';
    this.defaultRecruiter.employeeId = 0;
    this.defaultSalesPerson.firstName = 'Select Sales Person';
    this.defaultSalesPerson.lastName = '';
    this.defaultSalesPerson.employeeId = 0;
    this.defaultCandSource.candidateSourceId = null;
    this.defaultCandSource.sourceName = 'Select Candidate Source';
    this.contractorAddEditForm = this.formBuilder.group({
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
      accessLevel: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      cellPhone: [''],
      emergencyContact: [''],
      ecPhone: [''],
      homeHealthStatus: [''],
      isContractService: [''],
      salesPerson: this.defaultSalesPerson,
      recruiter: this.defaultRecruiter,
      toReleaseTimesheet: [true, [Validators.required]]
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
      this.loadRecruitersCandSources();
    }
  }

  private loadRecruitersCandSources() {
    this.alertService.clear();
    forkJoin([this.contractorService.getAllRecruiters(), this.contractorService.getAllCandidateSources()])
      .subscribe(([recruiters, candidatesources]) => {
        this.recruiters = recruiters as Recruiter[];
        this.salesPersonList = cloneDeep(recruiters as Recruiter[]);
        this.candSources = candidatesources as CandidateSource[];
        this.recruiters.splice(0, 0, this.defaultRecruiter);
        this.salesPersonList.splice(0, 0, this.defaultSalesPerson);
        this.candSources.splice(0, 0, this.defaultCandSource);
        
        this.contractorAddEditForm.get('recruiter').patchValue(0);
        this.contractorAddEditForm.get('salesPerson').patchValue(0);
        this.contractorAddEditForm.get('candidateSourceId').patchValue(null);
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
    forkJoin([this.contractorService.getContractorById(this.contractorId),
      this.contractorService.getAllRecruiters(), this.contractorService.getAllCandidateSources()])
      .subscribe(([contractor, recruiters, candidatesources]) => {
        this.recruiters = recruiters as Recruiter[];
        this.salesPersonList = cloneDeep(recruiters as Recruiter[]);
        this.candSources = candidatesources as CandidateSource[];
        this.contractor = contractor as ContractorListResponse;
        this.recruiters.splice(0, 0, this.defaultRecruiter);
        this.salesPersonList.splice(0, 0, this.defaultSalesPerson);
        this.candSources.splice(0, 0, this.defaultCandSource);
        delete this.contractor.password;
        this.contractorAddEditForm.patchValue(this.contractor);
        this.contractorAddEditForm.get('toReleaseTimesheet').patchValue(this.contractor.toReleaseTimesheet?'true':'false');
        if (this.contractor.recruiterId > 0) {
          this.contractorAddEditForm.get('recruiter').patchValue(this.contractor.recruiterId);
        } else {
          this.contractorAddEditForm.get('recruiter').patchValue(0);
        }
        if (this.contractor.salesPersonId > 0) {
          this.contractorAddEditForm.get('salesPerson').patchValue(this.contractor.salesPersonId);
        } else {
          this.contractorAddEditForm.get('salesPerson').patchValue(0);
        }
        this.contractorAddEditForm.get('candidateSourceId').patchValue(this.contractor.candidateSourceId);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.contractorAddEditForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.contractorAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createContractor();
    } else {
        this.updateContractor();
    }
  }

  private createContractor() {
    const request = this.setContractorRequest() as ContractorRequest;
    this.contractorService.createContractor(request)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.router.navigate(['contractor-list'], {queryParams: { message: response.message, action: this.action }});
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  private updateContractor() {
      const request = this.setContractorRequest() as ContractorRequest;
      this.contractorService.updateContractor(this.contractorId, request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.router.navigate(['contractor-list'], {queryParams: { message: response.message, action: this.action }});            
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

  private setContractorRequest(): ContractorRequest {
    const request = new ContractorRequest();
    request.user = this.user;
    request.firstName = this.contractorAddEditForm.controls.firstName.value;
    request.lastName = this.contractorAddEditForm.controls.lastName.value;
    request.homeHealthStatus = this.contractorAddEditForm.controls.homeHealthStatus.value;
    request.isContractService = false;
    request.phone = this.contractorAddEditForm.controls.phone.value;
    request.cellPhone = this.contractorAddEditForm.controls.cellPhone.value;
    request.emergencyContact = this.contractorAddEditForm.controls.emergencyContact.value;
    request.ecPhone = this.contractorAddEditForm.controls.ecPhone.value;
    request.address = this.contractorAddEditForm.controls.address.value;
    request.address2 = this.contractorAddEditForm.controls.address2.value;
    request.city = this.contractorAddEditForm.controls.city.value;
    request.state = this.contractorAddEditForm.controls.state.value;
    request.zip = this.contractorAddEditForm.controls.zip.value;
    request.recruiterId = +this.contractorAddEditForm.controls.recruiter.value;
    request.salesPersonId = +this.contractorAddEditForm.controls.salesPerson.value;
    request.candidateSourceId = +this.contractorAddEditForm.controls.candidateSourceId.value;
    request.ssn = this.contractorAddEditForm.controls.ssn.value;
    request.toReleaseTimesheet = this.contractorAddEditForm.controls.toReleaseTimesheet.value === 'true' ? true : false;
    request.emailAddress = this.contractorAddEditForm.controls.emailAddress.value;
    request.accessLevel = this.contractorAddEditForm.controls.accessLevel.value;
    request.password = this.contractorAddEditForm.controls.password.value;
    return request;
  }

  public hasError = (controlName: string) => {
    return this.contractorAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'firstname': 
        this.contractorAddEditForm.controls.firstName.patchValue('');
        break;
      case 'lastname':
        this.contractorAddEditForm.controls.lastName.patchValue('');
        break;
      case 'ssn':
        this.contractorAddEditForm.controls.ssn.patchValue('');
        break;
      case 'emailAddress':
        this.contractorAddEditForm.controls.emailAddress.patchValue('');
        break;
      case 'address':
        this.contractorAddEditForm.controls.address.patchValue('');
        break;
      case 'address2':
        this.contractorAddEditForm.controls.address2.patchValue('');
        break;
      case 'city':
        this.contractorAddEditForm.controls.city.patchValue('');
        break;
      case 'state':
        this.contractorAddEditForm.controls.state.patchValue('');
        break;
      case 'zip':
        this.contractorAddEditForm.controls.zip.patchValue('');
        break;
      case 'phone':
        this.contractorAddEditForm.controls.phone.patchValue('');
        break;
      case 'cellPhone':
        this.contractorAddEditForm.controls.cellPhone.patchValue('');
        break;
      case 'emergencyContact':
        this.contractorAddEditForm.controls.emergencyContact.patchValue('');
        break;
      case 'ecPhone':
        this.contractorAddEditForm.controls.ecPhone.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'firstname': 
        if (this.contractorAddEditForm.controls.firstName.hasError('required')) {
          return 'First name is required';
        }
        break;
      case 'lastname':
        if (this.contractorAddEditForm.controls.lastName.hasError('required')) {
          return 'Last name is required';
        }
        break;
      case 'ssn':
        if (this.contractorAddEditForm.controls.ssn.hasError('required')) {
          return 'SSN is required';
        } else if (this.contractorAddEditForm.controls.ssn.hasError('invalidSsn')) {
          return 'SSN must be 9 numeric digits';
        }
        break;
      case 'emailAddress':
        if (this.contractorAddEditForm.controls.emailAddress.hasError('required')) {
          return 'Email address is required';
        } else if (this.contractorAddEditForm.controls.emailAddress.hasError('email')) {
          return 'Email must be a valid email address';
        }
        break;
      case 'address':
        if (this.contractorAddEditForm.controls.address.hasError('required')) {
          return 'Address is required';
        }
        break;
      case 'city':
        if (this.contractorAddEditForm.controls.city.hasError('required')) {
          return 'City is required';
        }
        break;
      case 'state':
        if (this.contractorAddEditForm.controls.state.hasError('required')) {
          return 'State is required';
        }
        break;
      case 'zip':
        if (this.contractorAddEditForm.controls.zip.hasError('required')) {
          return 'Zip is required';
        } else if (this.contractorAddEditForm.controls.zip.hasError('pattern')) {
          return 'Zip code must be a 5 or 9 digit number(Ex: 98745-4321).';
        }
        break;
      case 'password':
        if (this.contractorAddEditForm.controls.password.hasError('required')) {
          return 'Password is required';
        }
        break;
      case 'confirmPassword':
        if (this.contractorAddEditForm.controls.confirmPassword.hasError('required')) {
          return 'Confirm password is required';
        } else if (this.contractorAddEditForm.controls.confirmPassword.hasError('mustMatch')) {
          return 'Passwords must match';
        }
        break;
      case 'candidateSourceId':
        if (this.contractorAddEditForm.controls.candidateSourceId.hasError('required')) {
          return 'Candidate source is required';
        }
        break;
      case 'accessLevel':
        if (this.contractorAddEditForm.controls.accessLevel.hasError('required')) {
          return 'Access level is required';
        }
        break;
      case 'phone':
        if (this.contractorAddEditForm.controls.phone.hasError('required')) {
          return 'Phone is required';
        }
        break;
    }
  }
}
