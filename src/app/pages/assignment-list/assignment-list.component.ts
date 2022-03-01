import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DatePipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { AssignmentService, AlertService, ExportService } from 'app/_services';
import { AssignmentListResponse, IApiResponse } from 'app/_models';
import { assignmentStatus } from 'app/constants/assignment-status';
import { UpdateAssignmentEndDateComponent } from './update-assignment-enddate/update-assignment-enddate.component';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AssignmentListComponent implements OnInit {
  assignmentId: number;
  statuses = assignmentStatus;
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
  public displayedColumns = ['clientName', 'contractorName', 'locationName', 'startDate', 'endDate',
    'status', 'payRate', 'billRate', 'position', 'permPlacementRate', 'permPlacementDate',
    'annualSalary', 'payMethod', 'adpFileNumber', 'star'];
  public dataSource = new MatTableDataSource<AssignmentListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(
    public alertService: AlertService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private percentPipe: PercentPipe,
    private dialog: MatDialog,
    private exportService: ExportService,
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
    this.buildDisplayedColumns(AssignmentListFormValue.assignmentStatus);
    this.executeGetReport(AssignmentListFormValue.assignmentStatus);
  };

  private executeGetReport(status: string) {
    return this.assignmentService.getAssignmentByStatus(status)
      .subscribe(result => {
        this.dataSource.data = result as AssignmentListResponse[];

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

  buildDisplayedColumns(status: string) {
    if (status === 'PermPlacement') {
      this.displayedColumns = ['clientName', 'contractorName', 'locationName', 'startDate',
        'status', 'billRate', 'position', 'permPlacementRate', 'permPlacementDate',
        'annualSalary', 'star'];
    } else {
      this.displayedColumns = ['clientName', 'contractorName', 'locationName', 'startDate', 'endDate',
        'status', 'payRate', 'billRate', 'position', 'permPlacementRate', 'permPlacementDate',
        'annualSalary', 'payMethod', 'adpFileNumber', 'star'];
    }
  }

  updateEndDate(assignment: AssignmentListResponse) {
    const modalref = this.dialog.open(UpdateAssignmentEndDateComponent, {
      panelClass: 'update-enddate-dialog',
      data: {
        assignment,
        updateEndDateTitle: assignment.contractorName.concat(' Assigned to ').concat(assignment.clientName)
      }
    });
    return false;
  }
  editAssignment(id: number) {
    this.router.navigate([`/edit-assignment/${id}`]);
  }

  viewAssignment(id: number) {
    this.router.navigate([`/view-assignment/${id}`]);
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
  exportToExcel(event) {
    this.exportService.exportExcelWithFormat(this.assignmentPrint(), 'assignmentreport', this.reportColumns());
    event.preventDefault();
  }
  reportColumns(): any[] {
    const leftColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'left' } };
    const centerColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'center' } };
    const rightColumnStyle = { font: { name: 'Calibri', size: 11 }, alignment: { horizontal: 'right' } };
    return [
      { header: 'Client', key: 'clientName', width: 30, style: centerColumnStyle },
      { header: 'Contractor', key: 'contractorName', width: 30, style: centerColumnStyle },
      { header: 'Location', key: 'locationName', width: 30, style: centerColumnStyle },
      { header: 'Start Date', key: 'startDate', width: 10, style: centerColumnStyle },
      { header: 'End Date', key: 'endDate', width: 10, style: centerColumnStyle },
      { header: 'Status', key: 'status', width: 8, style: centerColumnStyle },
      ...(this.assignmentListForm.controls.assignmentStatus.value !== 'PermPlacement'?
      [{ header: 'Pay Rate(OT)', key: 'payRate', width: 16, style: rightColumnStyle }] : []),
      { header: 'Bill Rate(OT)', key: 'billRate', width: 16, style: rightColumnStyle },
      { header: 'Position', key: 'position', width: 30, style: centerColumnStyle },
      { header: 'PP Rate', key: 'permPlacementRate', width: 8, style: rightColumnStyle },
      { header: 'PP Date', key: 'permPlacementDate', width: 10, style: rightColumnStyle },
      { header: 'Annual Salary', key: 'annualSalary', width: 8, style: rightColumnStyle },
      { header: 'Pay Method', key: 'payMethod', width: 8, style: rightColumnStyle },
      { header: 'ADP File Number', key: 'adpFileNumber', width: 8, style: rightColumnStyle }];
  }
  assignmentPrint() {
    let data = [];
    this.dataSource.data.forEach(item => {
      data.push({
        'clientName': item.clientName,
        'contractorName': item.contractorName,
        'locationName': item.locationName,
        'startDate': this.datePipe.transform(item.startDate, 'MM/dd/yyyy'),
        'endDate': this.datePipe.transform(item.endDate, 'MM/dd/yyyy'),
        'status': item.status,
        'payRate': this.currencyPipe.transform(item.payRate)
        .concat('('+this.currencyPipe.transform(item.otRate)+')'),
        'billRate': this.currencyPipe.transform(item.billRate)
        .concat('('+this.currencyPipe.transform(item.otBillRate)+')'),
        'position': item.position,
        'permPlacementRate': this.percentPipe.transform(item.permPlacementRate, '1.2-2'),
        'permPlacementDate': this.datePipe.transform(item.permPlacementDate, 'MM/dd/yyyy'),
        'annualSalary': this.currencyPipe.transform(item.annualSalary),
        'payMethod': item.payMethod,
        'adpFileNumber': item.adpFileNumber
      })
    });
    return data;
  }
}
