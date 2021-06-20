import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router  } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ContractorService, AlertService, AuthenticationService } from 'app/_services';
import { ContractorListResponse, IApiResponse } from 'app/_models';
import { contractorStatus } from 'app/constants/contractor-status';

@Component({
  selector: 'app-contractor-list',
  templateUrl: './contractor-list.component.html',
  styleUrls: ['./contractor-list.component.css']
})
export class ContractorListComponent implements OnInit {
  contractorId: number;
  statuses = contractorStatus;
  selectedContractor: ContractorListResponse;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() contractorListForm: FormGroup;
  floatLabelControl = new FormControl('auto');
  public displayedColumns = ['firstName', 'created', 'modified', 'user', 'star'];
  public dataSource = new MatTableDataSource<ContractorListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    fb: FormBuilder,
    private dialog: MatDialog,
    private contractorService: ContractorService,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.contractorListForm = fb.group({
        contractorStatus: 'Active'
      });
      this.selectedContractor = new ContractorListResponse();
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.spinner.show();
      this.executeGetReport('Active');
    });
  }

  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }

  public showContractorList = (contractorListFormValue) => {
    this.spinner.show();
    this.executeGetReport(contractorListFormValue.contractorStatus);
  };

  private executeGetReport(status: string) {
    return this.contractorService.getContractorByStatus(status)        
    .subscribe(result => {
      this.dataSource.data = result as ContractorListResponse[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      window.scrollTo(0, 0);
      this.spinner.hide();
    },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }

  navigateToAddContractor(contractor: ContractorListResponse) {
    this.router.navigate(['/add-contractor']);
  }

  navigateToEditContractor(id: number) {
    this.router.navigate(['/edit-contractor'],
    { queryParams: { contractorid: id }, skipLocationChange: false });
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedContractor.firstName = this.dataSource.data.find(c => c.contractorId === id).firstName;
    this.selectedContractor.lastName = this.dataSource.data.find(c => c.contractorId === id).lastName;
    this.selectedContractor.contractorId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteContractor() {
    this.spinner.show();
    this.contractorService.deleteContractor(this.selectedContractor.contractorId)
      .subscribe((response: IApiResponse) => {
        this.executeGetReport(this.contractorListForm.controls.contractorStatus.value);
        this.alertService.success(response.message);
      },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }
}
