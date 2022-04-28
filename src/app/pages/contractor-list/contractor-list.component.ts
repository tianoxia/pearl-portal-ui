import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileUploadValidators } from '@iplab/ngx-file-upload';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router  } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import { ContractorService, AlertService, AuthenticationService } from 'app/_services';
import { ContractorListResponse, IApiResponse, PermissionType, Resource } from 'app/_models';
import { contractorStatus } from 'app/constants/contractor-status';

@Component({
  selector: 'app-contractor-list',
  templateUrl: './contractor-list.component.html',
  styleUrls: ['./contractor-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ContractorListComponent implements OnInit {
  contractorId: number;
  statuses = contractorStatus;
  subTitle: string;
  selectedContractor: ContractorListResponse;
  @ViewChild('ctrTable', {read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('uploadFilesDialog', { static: true, read: TemplateRef }) uploadFilesRef: TemplateRef<any>;
  @ViewChild('viewFilesDialog', { static: true, read: TemplateRef }) viewFilesRef: TemplateRef<any>;
  @Input() contractorListForm: FormGroup;
  @Input() contractorUploadFilesForm: FormGroup;
  isAddEdit: boolean;
  message: string;
  floatLabelControl = new FormControl('auto');
  private filesControl = new FormControl(null, FileUploadValidators.fileSize(10000000));
  public displayedColumns = ['firstName', 'created', 'modified', 'user', 'star'];
  public dataSource = new MatTableDataSource<ContractorListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    fb: FormBuilder,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private contractorService: ContractorService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.contractorListForm = fb.group({
        contractorStatus: 'Active'        
      });
      this.contractorUploadFilesForm = fb.group({
        files: this.filesControl
      });
      this.selectedContractor = new ContractorListResponse();
  }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.Contractors && e.permissionTypes.includes(PermissionType.LIST))) {
        this.router.navigateByUrl("/unauthorized");
      }
    }
    this.route.queryParamMap.subscribe(params => {
      this.spinner.show();
      this.message = params.get('message');
      const action = params.get('action');
      if (action) {
        this.isAddEdit = action.toLowerCase() === 'add' || action.toLowerCase() === 'edit';
      }      
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
      if (this.isAddEdit) {
        this.alertService.success(this.message);
      }
      this.subTitle = ' ('+this.dataSource.data.length+' Records)';
      window.scrollTo(0, 0);
      this.spinner.hide();
    },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }

  navigateToEditContractor(id: number) {
    this.router.navigate([`/edit-contractor/${id}`]);
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

  public hasError = (controlName: string) => {
    return this.contractorUploadFilesForm.controls[controlName].hasError('required');
  }

  uploadFiles() {    
    if (this.contractorUploadFilesForm.get('files').value === null) {
      this.contractorUploadFilesForm.controls.files.setErrors({ required: true })
      return false;
    }
    const formData = new FormData();
    if (this.contractorUploadFilesForm.get('files').value !== null) {
      this.contractorUploadFilesForm.get('files').value.forEach((f) => formData.append('files', f));
    }
    this.contractorUploadFilesForm.get('files').patchValue([]); // empty files container in UI
    this.contractorUploadFilesForm.get('files').patchValue(null); // set object to null  
    formData.append('contractorId', this.selectedContractor.contractorId.toString());
    this.contractorService.uploadContractorFiles(formData)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.contractorUploadFilesForm.get('files').patchValue([]); // empty files container in UI
          this.contractorUploadFilesForm.get('files').patchValue(null); // set object to null for further upload
          this.alertService.success(response.message);
          window.scrollTo(0, 0);
          this.spinner.hide();
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
    this.dialog.closeAll();
  }

  uploadAttachments(id: number) {
    this.selectedContractor.firstName = this.dataSource.data.find(c => c.contractorId === id).firstName;
    this.selectedContractor.lastName = this.dataSource.data.find(c => c.contractorId === id).lastName;
    this.selectedContractor.contractorId = id;
    this.openUploadFilesDialog(this.uploadFilesRef);
    return false;
  }

  openUploadFilesDialog(uploadFilesDialog) {
    this.dialog.open(uploadFilesDialog, {
      autoFocus: true,
      width: '700px',
      disableClose: true
    });
    return false;
  }

  viewAttachments(id: number) {
    this.selectedContractor.firstName = this.dataSource.data.find(c => c.contractorId === id).firstName;
    this.selectedContractor.lastName = this.dataSource.data.find(c => c.contractorId === id).lastName;
    this.selectedContractor.contractorId = id;
    this.openViewFilesDialog(this.viewFilesRef);
    this.contractorService.getContractorFiles(id)
        .pipe(first())
        .subscribe((response: ContractorListResponse) => {
          this.selectedContractor = response;
          window.scrollTo(0, 0);
          this.spinner.hide();
        },
        error => {
          window.scrollTo(0, 0);
          this.alertService.error(error);
          this.spinner.hide();
        });
    return false;
  }

  openViewFilesDialog(viewFilesDialog) {
    this.dialog.open(viewFilesDialog, {
      autoFocus: true,
      width: '400px',
      panelClass: 'file-dialog',
      disableClose: true
    });    
    return false;
  }

  onPaginateChange(event){
    window.scrollTo(0, 0);
  }
}
