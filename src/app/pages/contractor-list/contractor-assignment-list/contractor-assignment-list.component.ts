import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DatePipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { AssignmentService, AlertService, AuthenticationService } from 'app/_services';
import { AssignmentListResponse, IApiResponse, PermissionType, Resource } from 'app/_models';
import { assignmentStatus } from 'app/constants/assignment-status';
import { UpdateAssignmentEndDateComponent } from './update-assignment-enddate/update-assignment-enddate.component';

@Component({
  selector: 'app-contractor-assignment-list',
  templateUrl: './contractor-assignment-list.component.html',
  styleUrls: ['./contractor-assignment-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AssignmentListComponent implements OnInit {
  assignmentId: number;
  statuses = assignmentStatus;
  subTitle: string;
  @Input() contractorId: number;
  selectedAssignment: AssignmentListResponse;
  @ViewChild('assignmentTable', { read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('updateEndDateDialog', { static: true, read: TemplateRef }) updateEndDateRef: TemplateRef<any>;
  @Input() assignmentListForm: FormGroup;
  isAddEdit: boolean;
  message: string;
  floatLabelControl = new FormControl('auto');
  public displayedColumns = ['clientName', 'status', 'startDate', 'endDate',
        'position', 'payRate', 'billRate', 'contactName', 'accountingContactName', 'accountingLocationName', 'star'];
  public dataSource = new MatTableDataSource<AssignmentListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private percentPipe: PercentPipe,
    private dialog: MatDialog,
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService) {
    this.assignmentListForm = fb.group({
      assignmentStatus: 'Active'
    });
    this.selectedAssignment = new AssignmentListResponse();
  }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.Assignments && e.permissionTypes.includes(PermissionType.LIST))) {
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

  public showAssignmentList = (AssignmentListFormValue) => {
    this.spinner.show();
    this.executeGetReport(AssignmentListFormValue.assignmentStatus);
  };

  private executeGetReport(status: string) {
    return this.assignmentService.getAssignmentByContractorId(status, this.contractorId)
      .subscribe(result => {
        this.dataSource.data = result as AssignmentListResponse[];

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

  buildDisplayedColumns() {    
      this.displayedColumns = ['clientName', 'status', 'startDate', 'endDate',
        'position', 'payRate', 'billRate', 'contactName', 'accountingContactName', 'accountingLocationName', 'star'];

  }

  updateEndDate(assignment: AssignmentListResponse) {
    const modalref = this.dialog.open(UpdateAssignmentEndDateComponent, {
      panelClass: 'update-enddate-dialog',
      data: {
        assignment,
        contractorId: this.contractorId,
        updateEndDateTitle: assignment.contractorName.concat(' Assigned to ').concat(assignment.clientName)
      }
    });
    return false;
  }
  editAssignment(assignmentId: number, contractorId: number) {
    this.router.navigate([`/edit-contractor-assignment/${assignmentId}/${contractorId}`]);
  }
  viewAssignmentHistory(id: number, contractorId: number) {
    this.router.navigate([`/view-contractor-assignment/${id}/${contractorId}`]);
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWarningDialog(warningDialog, id: number) {
    this.selectedAssignment.contractorName = this.dataSource.data.find(c => c.assignmentId === id).contractorName;
    this.selectedAssignment.assignmentId = id;
    this.dialog.open(warningDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });
  }

  deleteAssignment() {
    this.spinner.show();
    this.assignmentService.deleteAssignment(this.selectedAssignment.assignmentId)
      .subscribe((response: IApiResponse) => {
        this.executeGetReport(this.assignmentListForm.controls.assignmentStatus.value);
        this.alertService.success(response.message);
      },
        error => {
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  onPaginateChange(event) {
    window.scrollTo(0, 0);
  }
}
