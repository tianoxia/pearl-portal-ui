import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

import { InvoiceGroupService, AlertService, AuthenticationService, ContactService } from 'app/_services';
import { InvoiceGroup, InvoiceGroupRequest, IApiResponse, OfficeLocation, Contact } from 'app/_models';
import { Term } from 'app/constants/term';

@Component({
  selector: 'app-add-edit-invoice-group',
  templateUrl: './add-edit-invoice-group.component.html',
  styleUrls: ['./add-edit-invoice-group.component.css']
})
export class AddEditInvoiceGroupComponent implements OnInit {
  @ViewChild('selectcontacts', { static: true }) selectContacts: MatSelect;
  @Input() invoiceGroupAddEditForm: FormGroup;
  invoiceGroupId: number;
  isAddMode: boolean;
  clientId: number;
  submitted = false;
  action: string;
  allSelected: boolean;
  contacts: Contact[];
  locations: OfficeLocation[];
  invoiceGroup: InvoiceGroup;
  terms = Term;
  user: string;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private invoiceGroupService: InvoiceGroupService,
    private contactService: ContactService,
    private alertService: AlertService) {
      this.invoiceGroup = new InvoiceGroup();
    }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.invoiceGroupId = this.route.snapshot.params['invoiceGroupId'];
    this.clientId = this.route.snapshot.params['clientId'];
    this.isAddMode = !this.invoiceGroupId;
    this.invoiceGroupAddEditForm = this.formBuilder.group({
      description: ['', Validators.required],
      billingLocation: '',
      term: '',
      contacts: new FormControl(new Contact()[''])
    });
    if (!this.isAddMode) {
        this.action = 'Edit';
        this.loadData();
    } else {
      this.action = 'Add';
      this.loadContactsAndLocations();
      this.spinner.hide();
    }
  }

  private loadContactsAndLocations() {
    this.alertService.clear();
    forkJoin([this.contactService.getContactsByClientId(this.clientId),
      this.contactService.getLocationsByClientId(this.clientId)])
      .subscribe(([contacts, locations]) => {       
        this.contacts = contacts as Contact[];
        this.locations = locations as OfficeLocation[];
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      }));
  }
  private loadData() {
    this.alertService.clear();
    forkJoin([this.invoiceGroupService.getInvoiceGroupById(this.invoiceGroupId),
      this.contactService.getContactsByClientId(this.clientId),
      this.contactService.getLocationsByClientId(this.clientId)])
      .subscribe(([invoiceGroup, contacts, locations]) => {
        this.invoiceGroup = invoiceGroup as InvoiceGroup;
        this.contacts = contacts as Contact[];
        this.locations = locations as OfficeLocation[];
        this.invoiceGroupAddEditForm.patchValue(this.invoiceGroup);
        this.invoiceGroupAddEditForm.get('term').patchValue(this.invoiceGroup.term);
        this.invoiceGroupAddEditForm.get('contacts').patchValue(this.invoiceGroup.invoiceContactIDs);
        this.invoiceGroupAddEditForm.get('billingLocation').patchValue(this.invoiceGroup.billingLocationId);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.invoiceGroupAddEditForm.controls; }

  onSubmit = (invoiceGroupFormValue) => {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.invoiceGroupAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    
    if (this.isAddMode) {
        this.createInvoiceGroup(invoiceGroupFormValue);
    } else {
        this.updateInvoiceGroup(invoiceGroupFormValue);
    }
  }

  private createInvoiceGroup(invoiceGroupFormValue: any) {
    const request = this.setInvoiceGroupRequest(invoiceGroupFormValue) as InvoiceGroupRequest;
    this.invoiceGroupService.createInvoiceGroup(request)
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

  private updateInvoiceGroup(invoiceGroupFormValue: any) {
      const request = this.setInvoiceGroupRequest(invoiceGroupFormValue) as InvoiceGroupRequest;
      this.invoiceGroupService.updateInvoiceGroup(this.invoiceGroupId, request)
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
  
  private setInvoiceGroupRequest(invoiceGroupFormValue: any): InvoiceGroupRequest {
    let contactIds = [];    
    const request = new InvoiceGroupRequest();
    request.clientId = +this.clientId;
    request.invoiceGroupId = +this.invoiceGroupId;
    request.billingLocationId = +this.invoiceGroupAddEditForm.controls.billingLocation.value;
    request.description = this.invoiceGroupAddEditForm.controls.description.value;
    request.term = this.invoiceGroupAddEditForm.controls.term.value;
    request.user = this.user;
    request.invoiceContactIDs = this.invoiceGroupAddEditForm.controls.contacts.value;
    return request;
  }

  public hasError = (controlName: string) => {
    return this.invoiceGroupAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'description': 
        this.invoiceGroupAddEditForm.controls.description.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'description': 
        if (this.invoiceGroupAddEditForm.controls.description.hasError('required')) {
          return 'Description is required';
        }
        break;
    }
  }
  toggleAllSelection() {
    if (this.allSelected) {
      this.selectContacts.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectContacts.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.selectContacts.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }
  navigateToClientView(id: number) {
    this.router.navigate([`/view-client/${id}`]);
  }
}
