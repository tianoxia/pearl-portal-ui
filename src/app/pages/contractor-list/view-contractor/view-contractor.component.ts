import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { AlertService, ContractorService } from 'app/_services';
import { ContractorListResponse } from 'app/_models';
import { payFrequency } from 'app/constants/pay-frequency';

@Component({
  selector: 'app-view-contractor',
  templateUrl: './view-contractor.component.html',
  styleUrls: ['./view-contractor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ViewContractorComponent implements OnInit {
  @Input() contractorViewForm: FormGroup;
  contractorId: number;
  viewContractorTitle: string;
  payFrequency = payFrequency;
  contractor: ContractorListResponse;
  user: string;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private contractorService: ContractorService,
    private alertService: AlertService) {
      this.contractor = new ContractorListResponse();
    }
    back(): void {
      this.router.navigate(['/contractor-list']);
    }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.contractorId = this.route.snapshot.params['contractorId'];
    this.contractorViewForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      ssn: [''],
      emailAddress: [''],
      address: [''],
      address2: [''],
      city: [''],
      state: [''],
      zip: [''],
      phone: [''],
      cellPhone: [''],
      emergencyContact: [''],
      ecPhone: ['']
    });
    this.loadData();
  }
  private loadData() {
    this.alertService.clear();
    this.contractorService.getContractorById(this.contractorId)
      .subscribe((contractor: ContractorListResponse) => {
        this.contractor = contractor;
        this.contractorViewForm.patchValue(this.contractor);
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
}
