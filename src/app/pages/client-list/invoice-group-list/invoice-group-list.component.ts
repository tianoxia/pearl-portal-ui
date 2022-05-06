import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router  } from '@angular/router';
import { FormControl } from '@angular/forms';

import { InvoiceGroupService, AlertService, AuthenticationService, ContactService } from 'app/_services';
import { InvoiceGroup, IApiResponse, OfficeLocation, Contact } from 'app/_models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-invoice-group-list',
  templateUrl: './invoice-group-list.component.html',
  styleUrls: ['./invoice-group-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class InvoiceGroupListComponent implements OnInit {
  invoiceGroupId: number;
  locations: OfficeLocation[];
  selectedInvoiceGroup: InvoiceGroup;
  @ViewChild('invoiceGroupTable', {read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() clientId: number;
  isAddEdit: boolean;
  isAdmin: boolean;
  message: string;
  floatLabelControl = new FormControl('auto');
  public displayedColumns = ['description', 'locationDisplay', 'modified', 'user', 'star'];
  public dataSource = new MatTableDataSource<InvoiceGroup>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private invoiceGroupService: InvoiceGroupService,
    private contactService: ContactService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.selectedInvoiceGroup = new InvoiceGroup();      
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

  public showInvoiceGroupList = () => {
    this.spinner.show();
    this.executeGetReport();
  };

  private executeGetReport() {
    forkJoin([this.invoiceGroupService.getInvoiceGroupsByClientId(this.clientId),
      this.contactService.getLocationsByClientId(this.clientId)])        
    .subscribe(([invoiceGroups, locations]) => {
      this.dataSource.data = invoiceGroups as InvoiceGroup[];
      this.locations = locations as OfficeLocation[];
      const temp = this.dataSource.data.map(itm => ({
        ...this.locations.find((item) => (item.locationId === itm.billingLocationId) && item),
        ...itm
      }));
      this.dataSource.data = temp;
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

  viewInvoiceGroup(id: number) {
    this.router.navigate([`/view-invoice-group/${id}`]);
  }

  navigateToEditInvoiceGroup(invoiceGroupId: number, clientId: number) {
    this.router.navigate([`/edit-invoice-group/${invoiceGroupId}/${clientId}`]);
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedInvoiceGroup.description = this.dataSource.data.find(c => c.invoiceGroupId === id).description;
    this.selectedInvoiceGroup.description = this.dataSource.data.find(c => c.invoiceGroupId === id).description;
    this.selectedInvoiceGroup.invoiceGroupId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteInvoiceGroup() {
    this.spinner.show();
    this.invoiceGroupService.deleteInvoiceGroup(this.selectedInvoiceGroup.invoiceGroupId)
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
