import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';

import { EmployeeService, AlertService, AuthenticationService } from 'app/_services';
import { MustMatch } from 'app/_helpers';
import { EmployeeListResponse, EmployeeRequest, Recruiter, IApiResponse } from 'app/_models';
import { employeeCategory } from 'app/constants/employee-category';
import { employeeStatus } from 'app/constants/employee-status';
import { accessLevel } from 'app/constants/access-level';
import { employeeTypeBurden } from 'app/constants/employee-type-burden';
import { salesRateStatus } from 'app/constants/sales-rate-status';
import { recruitRateStatus } from 'app/constants/recruit-rate-status';
import { rates } from 'app/constants/sales-recruit-rates';
import { payMethod } from 'app/constants/pay-method';

@Component({
  selector: 'app-add-edit-employee',
  templateUrl: './add-edit-employee.component.html',
  styleUrls: ['./add-edit-employee.component.scss']
})
export class AddEditEmployeeComponent implements OnInit {
  @Input() employeeAddEditForm: FormGroup;
  employeeId: number;
  isAddMode: boolean;
  submitted = false;
  showPassword = false;
  isRecruiter: boolean = true;
  isReferer: boolean = false;
  showConfirmPassword = false;
  statuses = employeeStatus.filter(e => e !== 'All');
  categories = employeeCategory;
  employeeTypes = employeeTypeBurden.map(e => e.employeeType).filter(e => e !== 'Perm Placement');
  accessLevels = accessLevel;
  action: string;
  employeeTypeBurden = employeeTypeBurden;
  salesRateStatuses = salesRateStatus;
  recruitRateStatuses = recruitRateStatus;
  payMethods = payMethod;
  rates = rates;
  teamLeads: Recruiter[];
  teamManagers: Recruiter[];
  defaultTeamLead: Recruiter;
  defaultTeamManager: Recruiter;
  employee: EmployeeListResponse;
  pwd_hide = true;
  cfm_pwd_hide = true;
  user: string;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private employeeService: EmployeeService,
    private alertService: AlertService) {}

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.employeeId = this.route.snapshot.params['employeeId'];
    this.isAddMode = !this.employeeId;
    this.employeeAddEditForm = this.formBuilder.group({
      employeeStatus: ['', Validators.required],
      category: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', [this.isAddMode ? Validators.required : Validators.nullValidator]],
      confirmPassword: ['', this.isAddMode ? Validators.required : Validators.nullValidator],
      accessLevel: '',
      teamLead: this.defaultTeamLead,
      teamManager: this.defaultTeamManager,
      employeeType: '',
      burdenRate: '',
      salesRateStatus: '',
      salesRate: '',
      recruitRateStatus: '',
      recruitRate: '',
      payType: '',
      payRate: '',
      otRate: '',
      dtRate: '',
      startDate: ['', Validators.required],
      endDate: '',
      payMethod: '',
      adpFileNumber: ['', [Validators.maxLength(6)]],
      isReferer: false
    }, {
        validator: MustMatch('password', 'confirmPassword')
    });
    const passwordValidators = [Validators.minLength(6)];
    if (this.isAddMode) {
      passwordValidators.push(Validators.required);
    }
    this.loadData();
  }

  private loadData() {
    this.alertService.clear();
    const observables = [];
    observables.push(this.employeeService.getActiveSales());

    if (!this.isAddMode) {
      this.action = 'Edit';
      observables.push(this.employeeService.getEmployeeById(this.employeeId));
    } else {
      this.action = 'Add';
    }
    forkJoin(observables).subscribe(data => {
        const recruiters = data[0] as Recruiter[];
        const employee = data[1] as EmployeeListResponse;

        this.teamLeads = recruiters;
        this.teamManagers = cloneDeep(recruiters);
        this.employee = employee as EmployeeListResponse;
        this.employeeAddEditForm.get('salesRateStatus').patchValue(0);
        this.employeeAddEditForm.get('recruitRateStatus').patchValue(0);
        this.employeeAddEditForm.get('salesRate').patchValue(0);
        this.employeeAddEditForm.get('recruitRate').patchValue(0);
        this.employeeAddEditForm.get('payType').patchValue('Salary');
        this.employeeAddEditForm.get('payMethod').patchValue('ADPACH');
        if (employee) {
          delete this.employee.password;
          this.employeeAddEditForm.patchValue(this.employee);
          if (this.employee.teamLeadId > 0) {
            this.employeeAddEditForm.get('teamLead').patchValue(this.employee.teamLeadId);
          }
          if (this.employee.teamManagerId > 0) {
            this.employeeAddEditForm.get('teamManager').patchValue(this.employee.teamManagerId);
          }
          if (this.employee.endDate.toString() === '0001-01-01T00:00:00') {
            this.employeeAddEditForm.get('endDate').patchValue(null);
          }
          this.isRecruiter = this.employee.category === 'Recruiter' ? true : false;
        }
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.employeeAddEditForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.employeeAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createEmployee();
    } else {
        this.updateEmployee();
    }
  }

  private createEmployee() {
    const request = this.setEmployeeRequest() as EmployeeRequest;
    this.employeeService.createEmployee(request)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.router.navigate(['employee-list'], {queryParams: { message: response.message, action: this.action }});
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  private updateEmployee() {
      const request = this.setEmployeeRequest() as EmployeeRequest;
      this.employeeService.updateEmployee(this.employeeId, request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.router.navigate(['employee-list'], {queryParams: { message: response.message, action: this.action }});            
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

  private setEmployeeRequest(): EmployeeRequest {
    const request = new EmployeeRequest();
    request.firstName = this.employeeAddEditForm.controls.firstName.value;
    request.lastName = this.employeeAddEditForm.controls.lastName.value;
    request.emailAddress = this.employeeAddEditForm.controls.emailAddress.value;
    request.password = this.employeeAddEditForm.controls.password.value;
    request.employeeStatus = this.employeeAddEditForm.controls.employeeStatus.value;
    request.category = this.employeeAddEditForm.controls.category.value;
    request.accessLevel = this.employeeAddEditForm.controls.accessLevel.value;
    request.isReferer = this.employeeAddEditForm.controls.isReferer.value;
    request.teamLeadId = +this.employeeAddEditForm.controls.teamLead.value;
    request.teamManagerId = +this.employeeAddEditForm.controls.teamManager.value;
    request.employeeType = this.employeeAddEditForm.controls.employeeType.value;
    request.burdenRate = +this.employeeAddEditForm.controls.burdenRate.value;
    request.salesRateStatus = this.employeeAddEditForm.controls.salesRateStatus.value;
    request.salesRate = +this.employeeAddEditForm.controls.salesRate.value;
    request.recruitRateStatus = this.employeeAddEditForm.controls.recruitRateStatus.value;
    request.recruitRate = +this.employeeAddEditForm.controls.recruitRate.value;
    request.payType = this.employeeAddEditForm.controls.payType.value;
    request.payRate = +this.employeeAddEditForm.controls.payRate.value;
    request.otRate = +this.employeeAddEditForm.controls.otRate.value;
    request.dtRate = +this.employeeAddEditForm.controls.dtRate.value;
    request.adpFileNumber = this.employeeAddEditForm.controls.adpFileNumber.value;
    request.payMethod = this.employeeAddEditForm.controls.payMethod.value;
    request.startDate = this.employeeAddEditForm.controls.startDate.value;
    request.endDate = this.employeeAddEditForm.controls.endDate.value;
    return request;
  }

  public hasError = (controlName: string) => {
    return this.employeeAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'firstname': 
        this.employeeAddEditForm.controls.firstName.patchValue('');
        break;
      case 'lastname':
        this.employeeAddEditForm.controls.lastName.patchValue('');
        break;
      case 'emailAddress':
        this.employeeAddEditForm.controls.emailAddress.patchValue('');
        break;
      case 'adpFileNumber':
        this.employeeAddEditForm.controls.adpFileNumber.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'employeeStatus':
        if (this.employeeAddEditForm.controls.employeeStatus.hasError('required')) {
          return 'Status is required';
        }
        break;
      case 'category':
        if (this.employeeAddEditForm.controls.category.hasError('required')) {
          return 'Category is required';
        }
        break;
      case 'firstname':
        if (this.employeeAddEditForm.controls.firstName.hasError('required')) {
          return 'First name is required';
        }
        break;
      case 'lastname':
        if (this.employeeAddEditForm.controls.lastName.hasError('required')) {
          return 'Last name is required';
        }
        break;
      case 'emailAddress':
        if (this.employeeAddEditForm.controls.emailAddress.hasError('required')) {
          return 'Email address is required';
        } else if (this.employeeAddEditForm.controls.emailAddress.hasError('email')) {
          return 'Email must be a valid email address';
        }
        break;
      case 'password':
        if (this.employeeAddEditForm.controls.password.hasError('required')) {
          return 'Password is required';
        }
        break;
      case 'confirmPassword':
        if (this.employeeAddEditForm.controls.confirmPassword.hasError('required')) {
          return 'Confirm password is required';
        } else if (this.employeeAddEditForm.controls.confirmPassword.hasError('mustMatch')) {
          return 'Passwords must match';
        }
        break;
      case 'startDate':
        if (this.employeeAddEditForm.controls.startDate.hasError('required')) {
          return 'Start date is required';
        }
        break;
      case 'adpFileNumber':
        if (this.employeeAddEditForm.controls.adpFileNumber.hasError('max')) {
          return 'Must be less than 6 characters';
        }
    }
  }

  compareSalesRateStatus(o1: any, o2: any) {
    return (o1 == o2);
  }

  comparePayMethod(o1: any, o2: any) {
    return (o1 == o2);
  }

  onEmployeeTypeChange() {
    const burden = this.employeeTypeBurden.filter(e => e.employeeType === this.employeeAddEditForm.controls.employeeType.value)[0].burdenRate;
    this.employeeAddEditForm.controls.burdenRate.patchValue(burden);
    return false;
  }

  onEmployeeCategoryChange() {
    this.isRecruiter = this.employeeAddEditForm.controls.category.value === 'Recruiter' ? true : false;
  }
}
