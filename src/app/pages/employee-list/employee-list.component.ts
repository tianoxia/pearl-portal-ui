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

import { EmployeeService, AlertService } from 'app/_services';
import { EmployeeListResponse, IApiResponse } from 'app/_models';
import { employeeStatus } from 'app/constants/employee-status';
import { employeeCategory } from 'app/constants/employee-category';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeListComponent implements OnInit {
  employeeId: number;
  statuses = employeeStatus;
  categories = employeeCategory;

  selectedEmployee: EmployeeListResponse;
  @ViewChild('ctrTable', {read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('uploadFilesDialog', { static: true, read: TemplateRef }) uploadFilesRef: TemplateRef<any>;
  @ViewChild('viewFilesDialog', { static: true, read: TemplateRef }) viewFilesRef: TemplateRef<any>;
  @Input() employeeListForm: FormGroup;
  @Input() employeeUploadFilesForm: FormGroup;
  isAddEdit: boolean;
  message: string;
  floatLabelControl = new FormControl('auto');
  private filesControl = new FormControl(null, FileUploadValidators.fileSize(10000000));
  public displayedColumns = ['firstName', 'accessLevel', 'payType', 'employeeStatus', 'emailAddress',
  'salesRate', 'recruitRate', 'payRate', 'otRate', 'dtRate', 'payMethod', 'adpFileNumber', 'employeeType', 'star'];
  public dataSource = new MatTableDataSource<EmployeeListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    fb: FormBuilder,
    private dialog: MatDialog,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.employeeListForm = fb.group({
        employeeStatus: 'Active',
        employeeCategory: 'Sales',
        isReferer: ''
      });
      this.employeeUploadFilesForm = fb.group({
        files: this.filesControl
      });
      this.selectedEmployee = new EmployeeListResponse();
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.spinner.show();
      this.message = params.get('message');
      const action = params.get('action');
      if (action) {
        this.isAddEdit = action.toLowerCase() === 'add' || action.toLowerCase() === 'edit';
      }      
      this.executeGetReport('Active', 'Sales', '');
    });
  }

  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }

  compareCategory(o1: any, o2: any) {
    return (o1 == o2);
  }

  public showEmployeeList = (employeeListFormValue) => {
    this.spinner.show();
    this.executeGetReport(employeeListFormValue.employeeStatus, employeeListFormValue.employeeCategory, employeeListFormValue.isReferer);
  };

  private executeGetReport(status: string, category: string, isReferer: string) {
    return this.employeeService.getEmployees(status, category, isReferer)
    .subscribe(result => {
      this.dataSource.data = result as EmployeeListResponse[];
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

  navigateToEditEmployee(id: number) {
    this.router.navigate([`/edit-employee/${id}`]);
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedEmployee.firstName = this.dataSource.data.find(c => c.employeeId === id).firstName;
    this.selectedEmployee.lastName = this.dataSource.data.find(c => c.employeeId === id).lastName;
    this.selectedEmployee.employeeId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteEmployee() {
    this.spinner.show();
    this.employeeService.deleteEmployee(this.selectedEmployee.employeeId)
      .subscribe((response: IApiResponse) => {
        this.executeGetReport(this.employeeListForm.controls.employeeStatus.value, this.employeeListForm.controls.employeeCategory.value,
          this.employeeListForm.controls.isReferer.value);
        this.alertService.success(response.message);
      },
      error => {
        this.alertService.error(error);
        this.spinner.hide();
      });
  }

  public hasError = (controlName: string) => {
    return this.employeeUploadFilesForm.controls[controlName].hasError('required');
  }

  uploadFiles() {    
    if (this.employeeUploadFilesForm.get('files').value === null) {
      this.employeeUploadFilesForm.controls.files.setErrors({ required: true })
      return false;
    }
    const formData = new FormData();
    if (this.employeeUploadFilesForm.get('files').value !== null) {
      this.employeeUploadFilesForm.get('files').value.forEach((f) => formData.append('files', f));
    }
    this.employeeUploadFilesForm.get('files').patchValue([]); // empty files container in UI
    this.employeeUploadFilesForm.get('files').patchValue(null); // set object to null  
    formData.append('employeeId', this.selectedEmployee.employeeId.toString());
    this.employeeService.uploadEmployeeFiles(formData)
        .pipe(first())
        .subscribe((response: IApiResponse) => {
          this.employeeUploadFilesForm.get('files').patchValue([]); // empty files container in UI
          this.employeeUploadFilesForm.get('files').patchValue(null); // set object to null for further upload
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
    this.selectedEmployee.firstName = this.dataSource.data.find(c => c.employeeId === id).firstName;
    this.selectedEmployee.lastName = this.dataSource.data.find(c => c.employeeId === id).lastName;
    this.selectedEmployee.employeeId = id;
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
    this.selectedEmployee.firstName = this.dataSource.data.find(c => c.employeeId === id).firstName;
    this.selectedEmployee.lastName = this.dataSource.data.find(c => c.employeeId === id).lastName;
    this.selectedEmployee.employeeId = id;
    this.openViewFilesDialog(this.viewFilesRef);
    this.employeeService.getEmployeeFiles(id)
        .pipe(first())
        .subscribe((response: EmployeeListResponse) => {
          this.selectedEmployee = response;
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
      width: '450px',
      panelClass: 'file-dialog',
      disableClose: true
    });    
    return false;
  }

  onPaginateChange(event){
    window.scrollTo(0, 0);
  }
}
