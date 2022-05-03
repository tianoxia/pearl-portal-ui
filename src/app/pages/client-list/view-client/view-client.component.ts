import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { ClientService, AlertService } from 'app/_services';
import { ClientListResponse, Location, Contact } from 'app/_models';
import { payFrequency } from 'app/constants/pay-frequency';

@Component({
  selector: 'app-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ViewClientComponent implements OnInit {
  @Input() clientViewForm: FormGroup;
  clientId: number;
  viewClientTitle: string;
  payFrequency = payFrequency;
  locations: Location[];
  contacts: Contact[];
  client: ClientListResponse;
  user: string;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private clientService: ClientService,
    private alertService: AlertService) {
      this.client = new ClientListResponse();
    }
    back(): void {
      this.router.navigate(['/client-list']);
    }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.clientId = this.route.snapshot.params['clientId'];
    this.clientViewForm = this.formBuilder.group({
      name: '',
      clientStatus: '',
      discount: '',
      mileageRate: '',
      isInternal: ''
    });
    this.loadData();
  }
  private loadData() {
    this.alertService.clear();
    this.clientService.getClientById(this.clientId)
      .subscribe((client: ClientListResponse) => {
        this.client = client;
        this.clientViewForm.patchValue(this.client);
        this.clientViewForm.get('clientStatus').patchValue(this.client.clientStatus ? 'Yes' : 'No');
        this.clientViewForm.get('isInternal').patchValue(this.client.isInternal ? 'Yes' : 'No');
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
}
