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

import { ClientService, AlertService, AuthenticationService, ExportService } from 'app/_services';
import { ClientListResponse, IApiResponse, PermissionType, Resource } from 'app/_models';
import { employeeStatus } from 'app/constants/employee-status';
import { UploadedFile } from 'app/_models/uploaded-file';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ClientListComponent implements OnInit {
  clientId: number;
  selectedClient: ClientListResponse;
  selectedFile: UploadedFile;
  @ViewChild('clientTable', {read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('uploadFilesDialog', { static: true, read: TemplateRef }) uploadFilesRef: TemplateRef<any>;
  @ViewChild('viewFilesDialog', { static: true, read: TemplateRef }) viewFilesRef: TemplateRef<any>;
  @Input() clientListForm: FormGroup;
  @Input() clientUploadFilesForm: FormGroup;
  isAddEdit: boolean;
  isAdmin: boolean;
  message: string;
  statuses = employeeStatus;
  subTitle: string;
  floatLabelControl = new FormControl('auto');
  private filesControl = new FormControl(null, FileUploadValidators.fileSize(10000000));
  public displayedColumns = ['name', 'salesPersonName', 'created', 'modified', 'user', 'star'];
  public dataSource = new MatTableDataSource<ClientListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    fb: FormBuilder,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private clientService: ClientService,
    private exportService: ExportService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.clientListForm = fb.group({
        clientStatus: 'Active'        
      });
      this.clientUploadFilesForm = fb.group({
        files: this.filesControl
      });
      this.selectedClient = new ClientListResponse();      
  }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {      
      this.isAdmin = this.authService.currentUserValue.role === 'Admin';
      
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.Clients && e.permissionTypes.includes(PermissionType.LIST))) {
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

  public showClientList = (clientListFormValue) => {
    this.spinner.show();
    this.executeGetReport(clientListFormValue.clientStatus);
  };

  private executeGetReport(status: string) {
    return this.clientService.getClientByStatus(status)        
    .subscribe(result => {
      this.dataSource.data = result as ClientListResponse[];
      this.dataSource.paginator = this.paginator;
      this.subTitle = ' ('+this.dataSource.data.length+' Records)';
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

  viewClient(id: number) {
    this.router.navigate([`/view-client/${id}`]);
  }

  navigateToEditClient(id: number) {
    this.router.navigate([`/edit-client/${id}`]);
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedClient.name = this.dataSource.data.find(c => c.clientId === id).name;
    this.selectedClient.clientId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteClient() {
    this.spinner.show();
    this.clientService.deleteClient(this.selectedClient.clientId)
      .subscribe((response: IApiResponse) => {
        this.executeGetReport(this.clientListForm.controls.clientStatus.value);
        this.alertService.success(response.message);
      },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }

  public hasError = (controlName: string) => {
    return this.clientUploadFilesForm.controls[controlName].hasError('required');
  }

  uploadFiles() {
    this.alertService.clear();
    if (this.clientUploadFilesForm.get('files').value === null) {
      this.clientUploadFilesForm.controls.files.setErrors({ required: true })
      return false;
    }
    const formData = new FormData();
    if (this.clientUploadFilesForm.get('files').value !== null) {
      this.clientUploadFilesForm.get('files').value.forEach((f) => formData.append('files', f));
    }
    this.clientUploadFilesForm.get('files').patchValue([]); // empty files container in UI
    this.clientUploadFilesForm.get('files').patchValue(null); // set object to null  
    formData.append('clientId', this.selectedClient.clientId.toString());
    this.clientService.uploadClientFiles(formData)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.clientUploadFilesForm.get('files').patchValue([]); // empty files container in UI
          this.clientUploadFilesForm.get('files').patchValue(null); // set object to null for further upload
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
    this.selectedClient.name = this.dataSource.data.find(c => c.clientId === id).name;
    this.selectedClient.clientId = id;
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
    this.selectedClient.name = this.dataSource.data.find(c => c.clientId === id).name;
    this.selectedClient.clientId = id;
    this.openViewFilesDialog(this.viewFilesRef);
    this.clientService.getClientFiles(id)
        .pipe(first())
        .subscribe((response: ClientListResponse) => {
          this.selectedClient = response;
          if (this.selectedClient.clientAttachments.length > 0) {
            this.selectedFile = new UploadedFile();
          }
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
      //panelClass: 'file-dialog',
      disableClose: true
    });    
    return false;
  }
  openWarningDialogTwo(warningDialog, id: number) {
    this.selectedFile.fileName = this.selectedClient.clientAttachments.find(f => f.fileId === id).fileName;
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
    this.clientService.deleteClientFile(this.selectedFile.fileId)
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
  exportToExcel(event) {
    this.exportService.exportExcelWithFormat(this.clientPrint(), 'clientreport', this.reportColumns());
    event.preventDefault();
  }
  reportColumns(): any[] {
    const leftColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'left' } };
    const centerColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'center' } };
    const rightColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'right' } };
    return [
      { header: 'Name', key: 'name', width: 30, style: centerColumnStyle },
      { header: 'Sales Person', key: 'salesPersonName', width: 28, style: centerColumnStyle },
      { header: 'Created Date', key: 'created', width: 15, style: centerColumnStyle },
      { header: 'Modified Date', key: 'modified', width: 15, style: centerColumnStyle },
      { header: 'By User', key: 'user', width: 28, style: centerColumnStyle }];
  }
  clientPrint() {
    let data = [];
    this.dataSource.data.forEach(item => {
      data.push({
        'name': item.name,
        'salesPersonName': item.salesPersonName,
        'modified': this.datePipe.transform(item.modified, 'MM/dd/yyyy'),
        'created': this.datePipe.transform(item.created, 'MM/dd/yyyy'),
        'user': item.user
      })
    });
    return data;
  }
}
