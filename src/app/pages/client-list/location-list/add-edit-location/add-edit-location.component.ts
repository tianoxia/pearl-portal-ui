import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { LocationService, AlertService, AuthenticationService } from 'app/_services';
import { Location, LocationRequest, IApiResponse, Resource, PermissionType } from 'app/_models';
import { states } from '../../../../constants/states';

@Component({
  selector: 'app-add-edit-location',
  templateUrl: './add-edit-location.component.html',
  styleUrls: ['./add-edit-location.component.css']
})
export class AddEditLocationComponent implements OnInit {
  @Input() locationAddEditForm: FormGroup;
  locationId: number;
  isAddMode: boolean;
  clientId: number;
  submitted = false;
  action: string;
  location: Location;
  states = states;
  user: string;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private locationService: LocationService,
    private alertService: AlertService) {
      this.location = new Location();
    }

  ngOnInit() {
    let perm;
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
      perm = this.authService.currentUserValue.employeePermissions;
    }
    window.scrollTo(0, 0);
    this.spinner.show();
    this.locationId = this.route.snapshot.params['locationId'];
    this.clientId = this.route.snapshot.params['clientId'];
    this.isAddMode = !this.locationId;
    const zipCodeRegex = /^(?!0{5})[0-9]{5}(?:-(?!0{4})[0-9]{4})?$/;
    this.locationAddEditForm = this.formBuilder.group({
      locationName: '',
      address: ['', Validators.required],
      address2: '',
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(zipCodeRegex)]]
    });
    if (!this.isAddMode) {
        this.action = 'Edit';
        if (!perm.find(e => e.resource === Resource.Location && e.permissionTypes.includes(PermissionType.EDIT))) {
          this.router.navigateByUrl("/unauthorized");
        }
        this.loadData();
    } else {
      this.action = 'Add';
      if (!perm.find(e => e.resource === Resource.Location && e.permissionTypes.includes(PermissionType.ADD))) {
        this.router.navigateByUrl("/unauthorized");
      }
      this.spinner.hide();
    }
  }

  private loadData() {
    this.alertService.clear();
    this.locationService.getLocationById(this.locationId)
      .subscribe((location: Location) => {
        this.location = location;
        this.locationAddEditForm.patchValue(this.location);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }

  get f() { return this.locationAddEditForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.locationAddEditForm.invalid) {
        return;
    }

    this.spinner.show();
    if (this.isAddMode) {
        this.createLocation();
    } else {
        this.updateLocation();
    }
  }

  private createLocation() {
    const request = this.setLocationRequest() as LocationRequest;
    this.locationService.createLocation(request)
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

  private updateLocation() {
      const request = this.setLocationRequest() as LocationRequest;
      this.locationService.updateLocation(this.locationId, request)
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
  
  private setLocationRequest(): LocationRequest {
    const request = new LocationRequest();
    request.clientId = +this.clientId;
    request.locationName = this.locationAddEditForm.controls.locationName.value;
    request.address = this.locationAddEditForm.controls.address.value;
    request.address2 = this.locationAddEditForm.controls.address2.value;
    request.city = this.locationAddEditForm.controls.city.value;
    request.state = this.locationAddEditForm.controls.state.value;
    request.zip = this.locationAddEditForm.controls.zip.value;
    return request;
  }

  public hasError = (controlName: string) => {
    return this.locationAddEditForm.controls[controlName].hasError;
  }

  reset(control: string) {
    switch (control) {
      case 'locationName': 
        this.locationAddEditForm.controls.locationName.patchValue('');
        break;
      case 'address':
        this.locationAddEditForm.controls.address.patchValue('');
        break;
      case 'address2':
        this.locationAddEditForm.controls.address2.patchValue('');
        break;
      case 'city': 
        this.locationAddEditForm.controls.city.patchValue('');
        break;
      case 'zip':
        this.locationAddEditForm.controls.zip.patchValue('');
        break;
    }
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'address': 
        if (this.locationAddEditForm.controls.address.hasError('required')) {
          return 'Address is required';
        }
        break;
      case 'city': 
        if (this.locationAddEditForm.controls.city.hasError('required')) {
          return 'City is required';
        }
        break;
      case 'state': 
        if (this.locationAddEditForm.controls.state.hasError('required')) {
          return 'State is required';
        }
        break;
      case 'zip': 
      if (this.locationAddEditForm.controls.zip.hasError('required')) {
        return 'Zip is required';
      } else if (this.locationAddEditForm.controls.zip.hasError('pattern')) {
        return 'Zip code must be a 5 or 9 digit number(Ex: 98745-4321).';
      }
        break;    
    }
  }
  navigateToClientView(id: number) {
    this.router.navigate([`/view-client/${id}`]);
  }
}
