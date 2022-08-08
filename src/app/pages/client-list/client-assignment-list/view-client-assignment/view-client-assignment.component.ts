import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AssignmentService, AlertService } from 'app/_services';
import { AssignmentListResponse, OfficeLocation, Contact,
  Client, ContractorListResponse } from 'app/_models';
import { payFrequency } from 'app/constants/pay-frequency';

@Component({
  selector: 'app-view-client-assignment',
  templateUrl: './view-client-assignment.component.html',
  styleUrls: ['./view-client-assignment.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ViewAssignmentComponent implements OnInit {
  @Input() assignmentViewForm: FormGroup;
  assignmentId: number;
  clientId: number;
  viewAssignmentTitle: string;
  payFrequency = payFrequency;
  locations: OfficeLocation[];
  contacts: Contact[];
  contractors: ContractorListResponse[];
  clients: Client[];
  assignment: AssignmentListResponse;
  user: string;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private assignmentService: AssignmentService,
    private alertService: AlertService) {
      this.assignment = new AssignmentListResponse();
    }
    back(): void {
      this.router.navigate([`/view-client/${this.clientId}`]);
    }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.assignmentId = +this.route.snapshot.params['assignmentId'];
    this.clientId = +this.route.snapshot.params['clientId'];
    this.assignmentViewForm = this.formBuilder.group({
      payFrequency: '',
      contact: '',
      assignmentStatus: '',
      location: '',
      accountingLocation: '',
      accountingContact: '',
      position: '',
      payRate: '',
      otRate: '',
      billRate: '',
      otBillRate: '',
      dtRate: '',
      dtBillRate: '',
      startDate: '',
      endDate: ''
    });
    this.loadData();
  }
  private loadData() {
    this.alertService.clear();
    forkJoin([this.assignmentService.getAssignmentById(this.assignmentId),
      this.assignmentService.getActiveClients(),
      this.assignmentService.getAllContractors()])
      .subscribe(([assignment, clients, contractors]) => {
        this.clients = clients as Client[];
        this.contractors = contractors as ContractorListResponse[];
        this.assignment = assignment as AssignmentListResponse;
        
        forkJoin([this.assignmentService.getLocationsByClientId(this.assignment.clientId),
          this.assignmentService.getContactsByClientId(this.assignment.clientId)])
          .subscribe(([locations, contacts]) => {
            window.scrollTo(0, 0);
            this.locations = locations as OfficeLocation[];
            this.contacts = contacts as Contact[];
            this.assignmentViewForm.patchValue(this.assignment);            
            const contractor = this.contractors.find(ctr => ctr.contractorId === this.assignment.contractorId);
            const location = this.locations.find(loc => loc.locationId === this.assignment.locationId);
            const client = this.clients.find(cl => cl.clientId === this.assignment.clientId);
            const contractorName = contractor.firstName.concat(' ').concat(contractor.lastName);
            const contact = this.contacts.find(ct => ct.contactId === this.assignment.contactId);
            const secondContact = this.contacts.find(ct => ct.contactId === this.assignment.accountingContactId);
            const accountingLocation = this.locations.find(sl => sl.locationId === this.assignment.accountingLocationId);
            const freq = this.payFrequency.find(p => p.value === this.assignment.payFrequency);
            this.assignmentViewForm.get('location').patchValue(location.locationName);
            this.assignmentViewForm.get('accountingLocation').patchValue(accountingLocation.locationName);
            this.assignmentViewForm.get('contact').patchValue(contact.firstName.concat(` ${contact.lastName}`));
            this.assignmentViewForm.get('accountingContact').patchValue(secondContact.firstName.concat(` ${secondContact.lastName}`));
            this.assignmentViewForm.get('assignmentStatus').patchValue(this.assignment.status);
            this.assignmentViewForm.get('payFrequency').patchValue(freq.label);
            this.assignmentViewForm.get('startDate').patchValue(this.datePipe.transform(this.assignment.startDate, 'MM/dd/yyy'));
            this.assignmentViewForm.get('endDate').patchValue(this.datePipe.transform(this.assignment.endDate, 'MM/dd/yyy'));
            this.viewAssignmentTitle = contractorName.concat(' Assigned to ').concat(client.name).concat(` at ${location.locationName}`);
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
}
