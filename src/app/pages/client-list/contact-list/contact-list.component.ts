import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router  } from '@angular/router';
import { FormControl } from '@angular/forms';

import { ContactService, AlertService, AuthenticationService } from 'app/_services';
import { Contact, IApiResponse, OfficeLocation } from 'app/_models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ContactListComponent implements OnInit {
  contactId: number;
  locations: OfficeLocation[];
  selectedContact: Contact;
  @ViewChild('contactTable', {read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() clientId: number;
  isAddEdit: boolean;
  isAdmin: boolean;
  message: string;
  floatLabelControl = new FormControl('auto');
  public displayedColumns = ['firstName', 'emailAddress', 'locationDisplay', 'star'];
  public dataSource = new MatTableDataSource<Contact>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private contactService: ContactService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.selectedContact = new Contact();      
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

  public showContactList = () => {
    this.spinner.show();
    this.executeGetReport();
  };

  private executeGetReport() {
    forkJoin([this.contactService.getContactsByClientId(this.clientId), this.contactService.getLocationsByClientId(this.clientId)])        
    .subscribe(([contacts, locations]) => {
      this.dataSource.data = contacts as Contact[];
      this.locations = locations as OfficeLocation[];
      const temp = this.dataSource.data.map(itm => ({
        ...this.locations.find((item) => (item.locationId === itm.locationId) && item),
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

  viewContact(id: number) {
    this.router.navigate([`/view-contact/${id}`]);
  }

  navigateToEditContact(contactId: number, clientId: number) {
    this.router.navigate([`/edit-contact/${contactId}/${clientId}`]);
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedContact.firstName = this.dataSource.data.find(c => c.contactId === id).firstName;
    this.selectedContact.lastName = this.dataSource.data.find(c => c.contactId === id).lastName;
    this.selectedContact.contactId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteContact() {
    this.spinner.show();
    this.contactService.deleteContact(this.selectedContact.contactId)
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
