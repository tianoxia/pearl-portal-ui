import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router  } from '@angular/router';
import { FormControl } from '@angular/forms';

import { LocationService, AlertService, AuthenticationService, ExportService } from 'app/_services';
import { OfficeLocation, IApiResponse } from 'app/_models';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LocationListComponent implements OnInit {
  locationId: number;
  selectedLocation: OfficeLocation;
  @ViewChild('locationTable', {read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() clientId: number;
  isAddEdit: boolean;
  isAdmin: boolean;
  message: string;
  floatLabelControl = new FormControl('auto');
  public displayedColumns = ['locationName', 'address', 'address2', 'city', 'state', 'zip', 'star'];
  public dataSource = new MatTableDataSource<OfficeLocation>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.selectedLocation = new OfficeLocation();      
  }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {      
      this.isAdmin = this.authService.currentUserValue.role === 'Admin';
    }
    this.route.queryParamMap.subscribe(params => {
      this.spinner.show();
      this.message = params.get('message');
      const action = params.get('action');
      if (action) {
        this.isAddEdit = action.toLowerCase() === 'add' || action.toLowerCase() === 'edit';
      }      
      this.executeGetReport();
    });
  }

  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }

  public showLocationList = () => {
    this.spinner.show();
    this.executeGetReport();
  };

  private executeGetReport() {
    return this.locationService.getLocationsByClientId(this.clientId)        
    .subscribe(result => {
      this.dataSource.data = result as OfficeLocation[];
      this.dataSource.paginator = this.paginator;
      if (this.isAddEdit) {
        this.alertService.success(this.message);
      }
      window.scrollTo(0, 0);
      this.spinner.hide();
    },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }

  viewLocation(id: number) {
    this.router.navigate([`/view-location/${id}`]);
  }

  navigateToEditLocation(locationId: number, clientId: number) {
    this.router.navigate([`/edit-location/${locationId}/${clientId}`]);
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedLocation.locationName = this.dataSource.data.find(c => c.locationId === id).locationName;
    this.selectedLocation.locationId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteLocation() {
    this.spinner.show();
    this.locationService.deleteLocation(this.selectedLocation.locationId)
      .subscribe((response: IApiResponse) => {
        this.executeGetReport();
        this.alertService.success(response.message);
      },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }

  onPaginateChange(event){
    window.scrollTo(0, 0);
  }
}
