import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';

import { AssignmentService, AlertService, AuthenticationService } from 'app/_services';
import { AssignmentListResponse, AssignmentRequest, OfficeLocation, InvoiceGroup, Contact, Department,
  Recruiter, IApiResponse, Office, Client, ContractorListResponse } from 'app/_models';
import { assignmentStatus } from 'app/constants/assignment-status';
import { employeeTypeBurden } from 'app/constants/employee-type-burden';
import { rates, refererRates, permPlacementRates } from 'app/constants/sales-recruit-rates';

@Component({
  selector: 'app-add-edit-client-assignment',
  templateUrl: './add-edit-client-assignment.component.html',
  styleUrls: ['./add-edit-client-assignment.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddEditAssignmentComponent implements OnInit {
  @Input() assignmentAddEditForm: FormGroup;
  assignmentId: number;
  statuses = assignmentStatus.filter(s => s !== 'All');
  employeeTypeBurden = employeeTypeBurden;
  rates = rates;
  clientId: number;
  refererRates = refererRates();
  permPlacementRates = permPlacementRates;
  isAddMode: boolean;
  submitted = false;
  action: string;
  offices: Office[];
  locations: OfficeLocation[];
  invoiceGroups: InvoiceGroup[];
  contacts: Contact[];
  departments: Department[];
  contractors: ContractorListResponse[];
  clients: Client[];
  recruiters: Recruiter[];
  salesPersonList: Recruiter[];
  defaultRecruiter: Recruiter;
  defaultSalesPerson: Recruiter;
  assignment: AssignmentListResponse;
  user: string;
  isAdminClerical: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private assignmentService: AssignmentService,
    private alertService: AlertService) {
      this.assignment = new AssignmentListResponse();
    }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
      this.isAdminClerical = this.authService.currentUserValue.role === 'Admin'
      || this.authService.currentUserValue.role === 'Clerical';
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.assignmentId = +this.route.snapshot.params['assignmentId'];
    this.clientId = +this.route.snapshot.params['clientId'];
    this.isAddMode = !this.assignmentId;
    this.defaultRecruiter = new Recruiter();
    this.defaultSalesPerson = new Recruiter();
    this.assignmentAddEditForm = this.formBuilder.group({
      office: '',
      client: ['', [Validators.required]],
      contractor: ['', [Validators.required]],
      location: ['', [Validators.required]],
      assignmentStatus: 'Pending',
      payFrequency: ['', [Validators.required]],
      contact: ['', [Validators.required]],
      invoiceGroup: ['', [Validators.required]],
      accountingLocation: ['', [Validators.required]],
      accountingContact: ['', [Validators.required]],
      employeeType: ['', [Validators.required]],
      position: ['', [Validators.required]],
      payRate: ['', [Validators.required]],
      otRate: ['', [Validators.required]],
      billRate: ['', [Validators.required]],
      otBillRate: ['', [Validators.required]],
      dtRate: '',
      dtBillRate: '',
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      adpFileNumber: '',
      department: '',
      purchaseOrder: '',
      isNightShift: false,
      notes: '',
      notes2: '',
      salesPerson: '',
      recruiter: '',
      burdenRate: '',
      salesRate: '',
      recruitRate: '',
      payMethod: '',
      referer: '',
      refererRate: '',
      permPlacementDate: null,
      permPlacementRate: '',
      annualSalary: '',
      secondReferer: '',
      secondRefererRate: ''
    });

    if (!this.isAddMode) {
        this.action = 'Edit';
        this.loadData();
    } else {
      this.action = 'Add';
      this.loadOfficesClientsContractorsRecruiters();
    }
  }

  private loadOfficesClientsContractorsRecruiters() {
    this.alertService.clear();
    forkJoin([this.assignmentService.getAllOffices(), this.assignmentService.getActiveClients(),
    this.assignmentService.getAllContractors(), this.assignmentService.getAllRecruiters(),
    this.assignmentService.getAllDepartments(), this.assignmentService.getLocationsByClientId(this.clientId),
    this.assignmentService.getInvoiceGroupsByClientId(this.clientId), this.assignmentService.getContactsByClientId(this.clientId)])
      .subscribe(([offices, clients, contractors, recruiters, departments, locations, invGrps, contacts]) => {
        this.offices = offices as Office[];
        this.clients = clients as Client[];
        this.locations = locations as OfficeLocation[];
        this.invoiceGroups = invGrps as InvoiceGroup[];
        this.contacts = contacts as Contact[];
        this.departments = departments as Department[];
        this.contractors = contractors as ContractorListResponse[];
        this.recruiters = recruiters as Recruiter[];
        this.salesPersonList = cloneDeep(recruiters as Recruiter[]);
        this.assignmentAddEditForm.controls.refererRate.patchValue(0);
        this.assignmentAddEditForm.get("office").patchValue(this.offices);
        this.assignmentAddEditForm.get('client').patchValue(this.clientId);
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
    forkJoin([this.assignmentService.getAssignmentById(this.assignmentId),
      this.assignmentService.getAllRecruiters(), this.assignmentService.getAllOffices(),
      this.assignmentService.getAllDepartments(), this.assignmentService.getActiveClients(),
      this.assignmentService.getAllContractors()])
      .subscribe(([assignment, recruiters, offices, departments, clients, contractors]) => {
        this.recruiters = recruiters as Recruiter[];
        this.salesPersonList = cloneDeep(recruiters as Recruiter[]);
        this.offices = offices as Office[];
        this.clients = clients as Client[];
        this.departments = departments as Department[];
        this.contractors = contractors as ContractorListResponse[];
        this.assignment = assignment as AssignmentListResponse;
        
        forkJoin([this.assignmentService.getLocationsByClientId(this.assignment.clientId),
          this.assignmentService.getInvoiceGroupsByClientId(this.assignment.clientId), this.assignmentService.getContactsByClientId(this.assignment.clientId)])
          .subscribe(([locations, invGrps, contacts]) => {
            window.scrollTo(0, 0);
            this.locations = locations as OfficeLocation[];
            this.invoiceGroups = invGrps as InvoiceGroup[];
            this.contacts = contacts as Contact[];
            this.assignmentAddEditForm.patchValue(this.assignment);
            this.assignmentAddEditForm.get('isNightShift').patchValue(this.assignment.isNightShift);
            this.assignmentAddEditForm.get('office').patchValue(this.assignment.officeId);
            this.assignmentAddEditForm.get('client').patchValue(this.assignment.clientId);
            this.assignmentAddEditForm.get('contractor').patchValue(this.assignment.contractorId);
            this.assignmentAddEditForm.get('location').patchValue(this.assignment.locationId);
            this.assignmentAddEditForm.get('accountingLocation').patchValue(this.assignment.accountingLocationId);
            this.assignmentAddEditForm.get('invoiceGroup').patchValue(this.assignment.invoiceGroupId);
            this.assignmentAddEditForm.get('contact').patchValue(this.assignment.contactId);
            this.assignmentAddEditForm.get('accountingContact').patchValue(this.assignment.accountingContactId);
            this.assignmentAddEditForm.get('department').patchValue(this.assignment.departmentId);
            this.assignmentAddEditForm.get('assignmentStatus').patchValue(this.assignment.status);
            this.assignmentAddEditForm.get('payFrequency').patchValue(this.assignment.payFrequency);
            this.assignmentAddEditForm.get('payMethod').patchValue(this.assignment.payMethod);
            if (this.assignment.recruiterId > 0) {
              this.assignmentAddEditForm.get('recruiter').patchValue(this.assignment.recruiterId);
            } else {
              this.assignmentAddEditForm.get('recruiter').patchValue(0);
            }
            if (this.assignment.salesPersonId > 0) {
              this.assignmentAddEditForm.get('salesPerson').patchValue(this.assignment.salesPersonId);
            } else {
              this.assignmentAddEditForm.get('salesPerson').patchValue(0);
            }
            if (this.assignment.refererId > 0) {
              this.assignmentAddEditForm.get('referer').patchValue(this.assignment.refererId);
            }
            if (this.assignment.secondRefererId > 0) {
              this.assignmentAddEditForm.get('secondReferer').patchValue(this.assignment.secondRefererId);
            }
            this.spinner.hide();
          },
          (error => {
            this.spinner.hide();
            this.alertService.error(error);
          })
        );
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.assignmentAddEditForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.assignmentAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createAssignment();
    } else {
        this.updateAssignment();
    }
  }

  private createAssignment() {
    const request = this.setAssignmentRequest() as AssignmentRequest;
    this.assignmentService.createAssignment(request)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.router.navigate([`view-client/${this.clientId}`], {queryParams: { message: response.message, action: this.action }});
          /* window.scrollTo(0, 0);
          this.alertService.success(response.message);
          this.spinner.hide(); */
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  private updateAssignment() {
      const request = this.setAssignmentRequest() as AssignmentRequest;
      this.assignmentService.updateAssignment(this.assignmentId, request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.router.navigate([`view-client/${this.clientId}`], {queryParams: { message: response.message, action: this.action }});            
            /* window.scrollTo(0, 0);            
            this.alertService.success(response.message);
            this.spinner.hide(); */
          },
          error => {
            window.scrollTo(0, 0);
            this.alertService.error(error);
            this.spinner.hide();
          });
  }

  private setAssignmentRequest(): AssignmentRequest {
    const request = new AssignmentRequest();

    request.officeID = +this.assignmentAddEditForm.controls.office.value;        
    request.clientID = +this.assignmentAddEditForm.controls.client.value;
    request.departmentID = +this.assignmentAddEditForm.controls.department.value;
    request.contractorID = +this.assignmentAddEditForm.controls.contractor.value;
    request.payRate = +this.assignmentAddEditForm.controls.payRate.value;
    request.otRate = +this.assignmentAddEditForm.controls.otRate.value;
    request.billRate = +this.assignmentAddEditForm.controls.billRate.value;
    request.otBillRate = +this.assignmentAddEditForm.controls.otBillRate.value;
    request.dtRate = +this.assignmentAddEditForm.controls.dtRate.value;
    request.dtBillRate = +this.assignmentAddEditForm.controls.dtBillRate.value;
    request.status = this.assignmentAddEditForm.controls.assignmentStatus.value;
    request.invoiceGroupID = +this.assignmentAddEditForm.controls.invoiceGroup.value;
    request.payFrequency = this.assignmentAddEditForm.controls.payFrequency.value;
    request.startDate = this.assignmentAddEditForm.controls.startDate.value;
    request.endDate = this.assignmentAddEditForm.controls.endDate.value;
    request.position = this.assignmentAddEditForm.controls.position.value;
    request.locationID = +this.assignmentAddEditForm.controls.location.value;
    request.contactID = this.assignmentAddEditForm.controls.contact.value;
    request.accountingLocationID = +this.assignmentAddEditForm.controls.accountingLocation.value;
    request.accountingContactID = this.assignmentAddEditForm.controls.accountingContact.value;
    request.burdenRate = +this.assignmentAddEditForm.controls.burdenRate.value;
    request.employeeType = this.assignmentAddEditForm.controls.employeeType.value;
    request.salesPersonID = +this.assignmentAddEditForm.controls.salesPerson.value;
    request.recruiterID = +this.assignmentAddEditForm.controls.recruiter.value;
    request.salesRate = +this.assignmentAddEditForm.controls.salesRate.value;
    request.recruitRate = +this.assignmentAddEditForm.controls.recruitRate.value;
    request.refererID = +this.assignmentAddEditForm.controls.referer.value;
    request.refererRate = +this.assignmentAddEditForm.controls.refererRate.value;
    request.secondRefererID = +this.assignmentAddEditForm.controls.secondReferer.value;
    request.secondRefererRate = +this.assignmentAddEditForm.controls.secondRefererRate.value;
    request.adpFileNumber = this.assignmentAddEditForm.controls.adpFileNumber.value;
    request.purchaseOrder = this.assignmentAddEditForm.controls.purchaseOrder.value;
    request.payMethod = this.assignmentAddEditForm.controls.payMethod.value;
    request.permPlacementDate = this.assignmentAddEditForm.controls.permPlacementDate.value;
    request.permPlacementRate = +this.assignmentAddEditForm.controls.permPlacementRate.value;
    request.isNightShift = this.assignmentAddEditForm.controls.isNightShift.value;
    request.annualSalary = +this.assignmentAddEditForm.controls.annualSalary.value;
    request.notes = this.assignmentAddEditForm.controls.notes.value;
	  request.notes_User = this.user;
	  request.notes2 = this.assignmentAddEditForm.controls.notes2.value;
	  request.notes2_User = this.user;
    return request;
  }
  optionClick(clientId: number) {
    this.spinner.show();
    forkJoin([this.assignmentService.getLocationsByClientId(clientId),
      this.assignmentService.getInvoiceGroupsByClientId(clientId), this.assignmentService.getContactsByClientId(clientId)])
      .subscribe(([locations, invGrps, contacts]) => {
        window.scrollTo(0, 0);
        this.locations = locations as OfficeLocation[];
        this.invoiceGroups = invGrps as InvoiceGroup[];
        this.contacts = contacts as Contact[];
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  public hasError = (controlName: string) => {
    return this.assignmentAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'firstname': 
        this.assignmentAddEditForm.controls.firstName.patchValue('');
        break;
      case 'lastname':
        this.assignmentAddEditForm.controls.lastName.patchValue('');
        break;
      case 'ssn':
        this.assignmentAddEditForm.controls.ssn.patchValue('');
        break;
      case 'emailAddress':
        this.assignmentAddEditForm.controls.emailAddress.patchValue('');
        break;
      case 'address':
        this.assignmentAddEditForm.controls.address.patchValue('');
        break;
      case 'address2':
        this.assignmentAddEditForm.controls.address2.patchValue('');
        break;
      case 'city':
        this.assignmentAddEditForm.controls.city.patchValue('');
        break;
      case 'state':
        this.assignmentAddEditForm.controls.state.patchValue('');
        break;
      case 'zip':
        this.assignmentAddEditForm.controls.zip.patchValue('');
        break;
      case 'phone':
        this.assignmentAddEditForm.controls.phone.patchValue('');
        break;
      case 'cellPhone':
        this.assignmentAddEditForm.controls.cellPhone.patchValue('');
        break;
      case 'emergencyContact':
        this.assignmentAddEditForm.controls.emergencyContact.patchValue('');
        break;
      case 'ecPhone':
        this.assignmentAddEditForm.controls.ecPhone.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'contractor': 
        if (this.assignmentAddEditForm.controls.contractor.hasError('required')) {
          return 'Contractor is required';
        }
        break;
      case 'client':
        if (this.assignmentAddEditForm.controls.client.hasError('required')) {
          return 'Client is required';
        }
        break;
      case 'payFrequency':
        if (this.assignmentAddEditForm.controls.payFrequency.hasError('required')) {
          return 'Pay frequency is required';
        }
        break;
      case 'location':
        if (this.assignmentAddEditForm.controls.location.hasError('required')) {
          return 'Locatin is required';
        }
        break;
      case 'invoiceGroup':
        if (this.assignmentAddEditForm.controls.invoiceGroup.hasError('required')) {
          return 'Invoice group is required';
        }
        break;
      case 'contact':
        if (this.assignmentAddEditForm.controls.contact.hasError('required')) {
          return 'Contact is required';
        }
        break;
      case 'employeeType':
        if (this.assignmentAddEditForm.controls.employeeType.hasError('required')) {
          return 'Employee type is required';
        }
        break;
      case 'position':
        if (this.assignmentAddEditForm.controls.position.hasError('required')) {
          return 'Position is required';
        }
        break;
      case 'payRate':
        if (this.assignmentAddEditForm.controls.payRate.hasError('required')) {
          return 'Pay rate is required';
        }
        break;
      case 'otRate':
        if (this.assignmentAddEditForm.controls.otRate.hasError('required')) {
          return 'Overtime rate is required';
        }
        break;
      case 'billRate':
        if (this.assignmentAddEditForm.controls.billRate.hasError('required')) {
          return 'Bill rate is required';
        }
        break;
      case 'otBillRate':
        if (this.assignmentAddEditForm.controls.otBillRate.hasError('required')) {
          return 'Overtime bill rate is required';
        }
        break;
      case 'startDate':
        if (this.assignmentAddEditForm.controls.startDate.hasError('required')) {
          return 'Start date is required';
        }
        break;
      case 'endDate':
        if (this.assignmentAddEditForm.controls.endDate.hasError('required')) {
          return 'End date is required';
        }
        break;
      case 'accountingLocation':
        if (this.assignmentAddEditForm.controls.accountingLocation.hasError('required')) {
          return 'Accounting locatin is required';
        }
        break;
      case 'accountingContact':
        if (this.assignmentAddEditForm.controls.accountingContact.hasError('required')) {
          return 'Second contact is required';
        }
        break;
    }
  }

  onEmployeeTypeChange() {
    const burden = this.employeeTypeBurden.filter(e => e.employeeType === this.assignmentAddEditForm.controls.employeeType.value)[0].burdenRate;
    this.assignmentAddEditForm.controls.burdenRate.patchValue(burden);
    return false;
  }
  navigateToClientView(id: number) {
    this.router.navigate([`/view-client/${id}`]);
  }
}
