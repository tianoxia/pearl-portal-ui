import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { ContactService, AlertService, AuthenticationService } from 'app/_services';
import { Contact, ContactRequest, IApiResponse, Resource, PermissionType, OfficeLocation } from 'app/_models';

@Component({
  selector: 'app-add-edit-contact',
  templateUrl: './add-edit-contact.component.html',
  styleUrls: ['./add-edit-contact.component.css']
})
export class AddEditContactComponent implements OnInit {
  @Input() contactAddEditForm: FormGroup;
  contactId: number;
  isAddMode: boolean;
  clientId: number;
  submitted = false;
  action: string;
  locations: OfficeLocation[];
  contact: Contact;
  user: string;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private contactService: ContactService,
    private alertService: AlertService) {
      this.contact = new Contact();
    }

  ngOnInit() {
    let perm;
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
      perm = this.authService.currentUserValue.employeePermissions;
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.contactId = this.route.snapshot.params['contactId'];
    this.clientId = this.route.snapshot.params['clientId'];
    this.isAddMode = !this.contactId;
    const zipCodeRegex = /^(?!0{5})[0-9]{5}(?:-(?!0{4})[0-9]{4})?$/;
    this.contactAddEditForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      cellPhone: '',
      fax: '',
      location: ['', Validators.required]
    });
    if (!this.isAddMode) {
        this.action = 'Edit';
        if (!perm.find(e => e.resource === Resource.Contact && e.permissionTypes.includes(PermissionType.EDIT))) {
          this.router.navigateByUrl("/unauthorized");
        }
        this.loadData();
    } else {
      this.action = 'Add';
      if (!perm.find(e => e.resource === Resource.Contact && e.permissionTypes.includes(PermissionType.ADD))) {
        this.router.navigateByUrl("/unauthorized");
      }
      this.loadLocations();
      this.spinner.hide();
    }
  }

  private loadLocations() {
    this.alertService.clear();
    this.contactService.getLocationsByClientId(this.clientId)
      .subscribe((locations: OfficeLocation[]) => {       
        this.locations = locations;
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      }));
  }
  private loadData() {
    this.alertService.clear();
    forkJoin([this.contactService.getContactById(this.contactId), this.contactService.getLocationsByClientId(this.clientId)])
      .subscribe(([contact, locations]) => {
        this.contact = contact as Contact;
        this.locations = locations as OfficeLocation[];
        this.contactAddEditForm.patchValue(this.contact);
        this.contactAddEditForm.get('location').patchValue(this.contact.locationId);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.contactAddEditForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.contactAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createContact();
    } else {
        this.updateContact();
    }
  }

  private createContact() {
    const request = this.setContactRequest() as ContactRequest;
    this.contactService.createContact(request)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.router.navigate([`/view-client/${this.clientId}`], {queryParams: { message: response.message, action: this.action }});
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  private updateContact() {
      const request = this.setContactRequest() as ContactRequest;
      this.contactService.updateContact(this.contactId, request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.router.navigate([`/view-client/${this.clientId}`], {queryParams: { message: response.message, action: this.action }});            
          },
          error => {
            window.scrollTo(0, 0);
            this.alertService.error(error);
            this.spinner.hide();
          });
  }
  
  private setContactRequest(): ContactRequest {
    const request = new ContactRequest();
    request.clientId = +this.clientId;
    request.contactId = +this.contactId;
    request.locationId = +this.contactAddEditForm.controls.location.value;
    request.firstName = this.contactAddEditForm.controls.firstName.value;
    request.lastName = this.contactAddEditForm.controls.lastName.value;
    request.emailAddress = this.contactAddEditForm.controls.emailAddress.value;
    request.phone = this.contactAddEditForm.controls.phone.value;
    request.cellPhone = this.contactAddEditForm.controls.cellPhone.value;
    request.fax = this.contactAddEditForm.controls.fax.value;
    return request;
  }

  public hasError = (controlName: string) => {
    return this.contactAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'firstName': 
        this.contactAddEditForm.controls.firstName.patchValue('');
        break;
      case 'lastName':
        this.contactAddEditForm.controls.lastName.patchValue('');
        break;
      case 'emailAddress':
        this.contactAddEditForm.controls.emailAddress.patchValue('');
        break;
      case 'phone': 
        this.contactAddEditForm.controls.phone.patchValue('');
        break;
      case 'fax':
        this.contactAddEditForm.controls.fax.patchValue('');
        break;
      case 'cellPhone':
        this.contactAddEditForm.controls.cellPhone.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'firstName': 
        if (this.contactAddEditForm.controls.firstName.hasError('required')) {
          return 'First name is required';
        }
        break;
      case 'lastName': 
        if (this.contactAddEditForm.controls.lastName.hasError('required')) {
          return 'Last name is required';
        }
        break;
      case 'emailAddress': 
      if (this.contactAddEditForm.controls.emailAddress.hasError('required')) {
        return 'Email address is required';
      } else if (this.contactAddEditForm.controls.emailAddress.hasError('email')) {
        return 'Email must be a valid email address';
      }
      case 'phone': 
        if (this.contactAddEditForm.controls.phone.hasError('required')) {
          return 'Phone is required';
        }
        break; 
      case 'location': 
        if (this.contactAddEditForm.controls.location.hasError('required')) {
          return 'Location is required';
        }
        break;    
    }
  }
  navigateToClientView(id: number) {
    this.router.navigate([`/view-client/${id}`]);
  }
}
