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

import { ProviderEmployeeService, AlertService, AuthenticationService } from 'app/_services';
import { ProviderEmployeeListResponse, IApiResponse, PermissionType, Resource } from 'app/_models';
import { employeeStatus } from 'app/constants/employee-status';
import { ServiceTypes } from 'app/constants/service-types';
import { UploadedFile } from 'app/_models/uploaded-file';
@Component({
  selector: 'app-provider-employee-list',
  templateUrl: './provider-employee-list.component.html',
  styleUrls: ['./provider-employee-list.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ProviderEmployeeListComponent implements OnInit {
  providerEmployeeId: number;
  statuses = employeeStatus;
  selectedProviderEmployee: ProviderEmployeeListResponse;
  @ViewChild('provEmpTable', {read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('uploadFilesDialog', { static: true, read: TemplateRef }) uploadFilesRef: TemplateRef<any>;
  @ViewChild('viewFilesDialog', { static: true, read: TemplateRef }) viewFilesRef: TemplateRef<any>;
  @Input() providerEmployeeListForm: FormGroup;
  @Input() providerEmployeeUploadFilesForm: FormGroup;
  isAddEdit: boolean;
  isAdmin: boolean;
  selectedFile: UploadedFile;
  message: string;
  subTitle: string;
  serviceTypes = ServiceTypes;
  floatLabelControl = new FormControl('auto');
  private filesControl = new FormControl(null, FileUploadValidators.fileSize(10000000));
  public displayedColumns = ['firstName', 'created', 'modified', 'user', 'star'];
  public dataSource = new MatTableDataSource<ProviderEmployeeListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    fb: FormBuilder,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private providerEmployeeService: ProviderEmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.providerEmployeeListForm = fb.group({
        providerEmployeeStatus: 'Active',
        serviceType: 'Richmond',
        isContractService: false
      });
      this.providerEmployeeUploadFilesForm = fb.group({
        files: this.filesControl
      });
      this.selectedProviderEmployee = new ProviderEmployeeListResponse();
      this.selectedFile = new UploadedFile();
  }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.isAdmin = this.authService.currentUserValue.role === 'Admin';
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.ProviderEmployees && e.permissionTypes.includes(PermissionType.LIST))) {
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
      this.executeGetReport('Active', 'Richmond', false);
    });
  }

  compareStatuses(o1: any, o2: any) {
    return (o1 === o2);
  }

  compareServiceType(o1: any, o2: any) {
    return (o1 === o2);
  }
  public showProviderEmployeeList = (providerEmployeeListFormValue) => {
    this.spinner.show();
    this.executeGetReport(providerEmployeeListFormValue.providerEmployeeStatus,
      providerEmployeeListFormValue.serviceType, providerEmployeeListFormValue.isContractService);
  };

  private executeGetReport(status: string, serviceType: string, isContractService: boolean) {
    return this.providerEmployeeService.getProviderEmployeeByStatusAndType(status, serviceType, isContractService)        
    .subscribe(result => {
      this.dataSource.data = result as ProviderEmployeeListResponse[];
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

  navigateToEditProviderEmployee(id: number) {
    this.router.navigate([`/edit-provider-employee/${id}`]);
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedProviderEmployee.firstName = this.dataSource.data.find(c => c.providerEmployeeId === id).firstName;
    this.selectedProviderEmployee.lastName = this.dataSource.data.find(c => c.providerEmployeeId === id).lastName;
    this.selectedProviderEmployee.providerEmployeeId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteProviderEmployee() {
    this.spinner.show();
    this.providerEmployeeService.deleteProviderEmployee(this.selectedProviderEmployee.providerEmployeeId)
      .subscribe((response: IApiResponse) => {
        this.executeGetReport(this.providerEmployeeListForm.controls.providerEmployeeStatus.value,
          this.selectedProviderEmployee.serviceType, this.selectedProviderEmployee.isContractService);
        this.alertService.success(response.message);
      },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }

  public hasError = (controlName: string) => {
    return this.providerEmployeeUploadFilesForm.controls[controlName].hasError('required');
  }

  uploadFiles() {    
    if (this.providerEmployeeUploadFilesForm.get('files').value === null) {
      this.providerEmployeeUploadFilesForm.controls.files.setErrors({ required: true })
      return false;
    }
    const formData = new FormData();
    if (this.providerEmployeeUploadFilesForm.get('files').value !== null) {
      this.providerEmployeeUploadFilesForm.get('files').value.forEach((f) => formData.append('files', f));
    }
    this.providerEmployeeUploadFilesForm.get('files').patchValue([]); // empty files container in UI
    this.providerEmployeeUploadFilesForm.get('files').patchValue(null); // set object to null  
    formData.append('providerEmployeeId', this.selectedProviderEmployee.providerEmployeeId.toString());
    this.providerEmployeeService.uploadProviderEmployeeFiles(formData)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.providerEmployeeUploadFilesForm.get('files').patchValue([]); // empty files container in UI
          this.providerEmployeeUploadFilesForm.get('files').patchValue(null); // set object to null for further upload
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
    this.selectedProviderEmployee.firstName = this.dataSource.data.find(c => c.providerEmployeeId === id).firstName;
    this.selectedProviderEmployee.lastName = this.dataSource.data.find(c => c.providerEmployeeId === id).lastName;
    this.selectedProviderEmployee.providerEmployeeId = id;
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
    this.spinner.show();
    this.selectedProviderEmployee.firstName = this.dataSource.data.find(c => c.providerEmployeeId === id).firstName;
    this.selectedProviderEmployee.lastName = this.dataSource.data.find(c => c.providerEmployeeId === id).lastName;
    this.selectedProviderEmployee.providerEmployeeId = id;
    this.openViewFilesDialog(this.viewFilesRef);
    this.providerEmployeeService.getProviderEmployeeFiles(id)
        .pipe(first())
        .subscribe((response: ProviderEmployeeListResponse) => {
          this.selectedProviderEmployee = response;
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
      disableClose: true
    });    
    return false;
  }

  openWarningDialogTwo(warningDialog, id: number) {
    this.selectedFile.fileName = this.selectedProviderEmployee.providerEmployeeAttachments.find(f => f.fileId === id).fileName;
    this.selectedFile.fileId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
    return false;
  }

  deleteFile() {
    this.alertService.clear();
    this.spinner.show();
    this.providerEmployeeService.deleteProviderEmployeeFile(this.selectedFile.fileId)
      .subscribe((response: IApiResponse) => {
        this.alertService.success(response.message);
        window.scrollTo(0, 0);
        this.spinner.hide();
      },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
    this.dialog.closeAll();
  }

  onPaginateChange(event){
    window.scrollTo(0, 0);
  }
}
