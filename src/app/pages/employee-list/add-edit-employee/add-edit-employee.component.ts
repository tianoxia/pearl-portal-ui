import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';

import { EmployeeService, AlertService, AuthenticationService } from 'app/_services';
import { MustMatch } from 'app/_helpers';
import { CustomValidator } from '../../../shared/validation';
import { EmployeeListResponse, EmployeeRequest, Recruiter, IApiResponse, CandidateSource } from 'app/_models';
import { states } from '../../../constants/states';

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
  showConfirmPassword = false;
  states = states;
  action: string;
  recruiters: Recruiter[];
  salesPersonList: Recruiter[];
  defaultRecruiter: Recruiter;
  defaultSalesPerson: Recruiter;
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
    this.defaultRecruiter = new Recruiter();
    this.defaultSalesPerson = new Recruiter();
    this.defaultRecruiter.firstName = 'Select Sales Team';
    this.defaultRecruiter.lastName = '';
    this.defaultRecruiter.employeeId = 0;
    this.defaultSalesPerson.firstName = 'Select Team Manager';
    this.defaultSalesPerson.lastName = '';
    this.defaultSalesPerson.employeeId = 0;
    this.employeeAddEditForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      ssn: ['', [Validators.required, CustomValidator.ssnValidator]],
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', [this.isAddMode ? Validators.required : Validators.nullValidator]],
      confirmPassword: ['', this.isAddMode ? Validators.required : Validators.nullValidator],
      accessLevel: ['', [Validators.required]],
      salesPerson: this.defaultSalesPerson,
      recruiter: this.defaultRecruiter
    }, {
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
    }
  }

  private loadData() {
    this.alertService.clear();
    forkJoin([this.employeeService.getEmployeeById(this.employeeId)])
      .subscribe(([employee, recruiters]) => {
        this.recruiters = recruiters as Recruiter[];
        this.salesPersonList = cloneDeep(recruiters as Recruiter[]);
        this.employee = employee as EmployeeListResponse;
        this.recruiters.splice(0, 0, this.defaultRecruiter);
        this.salesPersonList.splice(0, 0, this.defaultSalesPerson);
        delete this.employee.password;
        this.employeeAddEditForm.patchValue(this.employee);
        if (this.employee.teamLeadId > 0) {
          this.employeeAddEditForm.get('teamLead').patchValue(this.employee.teamLeadId);
        } else {
          this.employeeAddEditForm.get('teamLead').patchValue(0);
        }
        if (this.employee.teamManagerId > 0) {
          this.employeeAddEditForm.get('teamManager').patchValue(this.employee.teamManagerId);
        } else {
          this.employeeAddEditForm.get('teamManager').patchValue(0);
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
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
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
    }
  }
}
