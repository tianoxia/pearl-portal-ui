import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { ClientService, AlertService, AuthenticationService } from 'app/_services';
import { ClientListResponse, ClientRequest, IApiResponse, Resource, PermissionType } from 'app/_models';

@Component({
  selector: 'app-add-edit-client',
  templateUrl: './add-edit-client.component.html',
  styleUrls: ['./add-edit-client.component.css']
})
export class AddEditClientComponent implements OnInit {
  @Input() clientAddEditForm: FormGroup;
  clientId: number;
  isAddMode: boolean;
  submitted = false;
  action: string;
  client: ClientListResponse;
  user: string;
  phoneRegex = /^(\()[1-9]\d{2}(\))(\s)[1-9]{1}\d{2}(-)\d{4}$/;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private clientService: ClientService,
    private alertService: AlertService) {
      this.client = new ClientListResponse();
    }

  ngOnInit() {
    let perm;
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
      perm = this.authService.currentUserValue.employeePermissions;
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.clientId = this.route.snapshot.params['clientId'];
    this.isAddMode = !this.clientId;
    const zipCodeRegex = /^(?!0{5})[0-9]{5}(?:-(?!0{4})[0-9]{4})?$/;
    this.clientAddEditForm = this.formBuilder.group({
      name: ['', Validators.required],
      clientStatus: 'Yes',
      discount: '',
      mileageRate: '',
      isInternal: 'No'
    });
    if (!this.isAddMode) {
        this.action = 'Edit';
        if (!perm.find(e => e.resource === Resource.Employee && e.permissionTypes.includes(PermissionType.EDIT))) {
          this.router.navigateByUrl("/unauthorized");
        }
        this.loadData();
    } else {
      this.action = 'Add';
      if (!perm.find(e => e.resource === Resource.Client && e.permissionTypes.includes(PermissionType.ADD))) {
        this.router.navigateByUrl("/unauthorized");
      }
      this.spinner.hide();
    }
  }

  private loadData() {
    this.alertService.clear();
    this.clientService.getClientById(this.clientId)
      .subscribe((client: ClientListResponse) => {
        this.client = client;
        this.clientAddEditForm.patchValue(this.client);
        this.clientAddEditForm.get('clientStatus').patchValue(this.client.clientStatus ? 'Yes' : 'No');
        this.clientAddEditForm.get('isInternal').patchValue(this.client.isInternal ? 'Yes' : 'No');
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.clientAddEditForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.clientAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createClient();
    } else {
        this.updateClient();
    }
  }

  private createClient() {
    const request = this.setClientRequest() as ClientRequest;
    this.clientService.createClient(request)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.router.navigate(['client-list'], {queryParams: { message: response.message, action: this.action }});
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  private updateClient() {
      const request = this.setClientRequest() as ClientRequest;
      this.clientService.updateClient(this.clientId, request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.router.navigate(['client-list'], {queryParams: { message: response.message, action: this.action }});            
          },
          error => {
            window.scrollTo(0, 0);
            this.alertService.error(error);
            this.spinner.hide();
          });
  }
  
  private setClientRequest(): ClientRequest {
    const request = new ClientRequest();
    request.user = this.user;
    request.name = this.clientAddEditForm.controls.name.value;
    request.clientStatus = this.clientAddEditForm.controls.clientStatus.value;
    request.isInternal = this.clientAddEditForm.controls.isInternal.value;
    request.mileageRate = +this.clientAddEditForm.controls.mileageRate.value;
    request.discount = +this.clientAddEditForm.controls.discount.value;
    return request;
  }

  public hasError = (controlName: string) => {
    return this.clientAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'name': 
        this.clientAddEditForm.controls.name.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'name': 
        if (this.clientAddEditForm.controls.name.hasError('required')) {
          return 'Client name is required';
        }
        break;
    }
  }
}
