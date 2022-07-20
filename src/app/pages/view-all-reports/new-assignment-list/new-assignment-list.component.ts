import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AssignmentService, AlertService, AuthenticationService } from 'app/_services';
import { AssignmentListResponse, NewAssignmentRequest, Recruiter } from 'app/_models';

@Component({
  selector: 'app-new-assignment-list',
  templateUrl: './new-assignment-list.component.html',
  styleUrls: ['./new-assignment-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NewAssignmentListComponent implements OnInit {
  subTitle: string;
  selectedAssignment: AssignmentListResponse;
  @ViewChild('assignmentTable', { read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() assignmentListForm: FormGroup;
  @Input() recruiters: Recruiter[];
  initLoad: boolean;
  user: string;
  isAdminClerical: boolean;
  defaultRecruiter: Recruiter;
  public displayedColumns = ['clientName', 'contractorName', 'locationName', 'startDate', 'endDate',
  'position', 'payRate', 'billRate', 'permPlacementRate', 'annualSalary', 'salesPerson', 'recruiter'];
  public dataSource = new MatTableDataSource<AssignmentListResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor (
    public alertService: AlertService,
    fb: FormBuilder,
    private authService: AuthenticationService,
    private assignmentService: AssignmentService,
    private router: Router,
    private spinner: NgxSpinnerService) {
      this.defaultRecruiter = new Recruiter();
      this.defaultRecruiter.firstName = 'All';
      this.defaultRecruiter.lastName = '';
      this.defaultRecruiter.employeeId = 0;
      this.assignmentListForm = fb.group({
        fromDate: new FormControl(new Date(new Date().getFullYear(), new Date().getMonth(), 1), [Validators.required]),
        toDate: new FormControl(new Date(), [Validators.required]),
        recruiter: this.defaultRecruiter
      });
      this.selectedAssignment = new AssignmentListResponse();
    }

  ngOnInit() {
    this.initLoad = true;
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
      if (this.authService.currentUserValue.role === 'Admin'
      || this.authService.currentUserValue.role === 'Clerical') {
        this.executeGetReport();
      } else {
        this.router.navigateByUrl("/unauthorized");
      }
    }    
  }

  compareRecruiters(o1: any, o2: any) {
    return (o1.firstName == o2.firstName && o1.lastName == o2.lastName && o1.employeeId == o2.employeeId);
  }

  public showAssignmentList = (AssignmentListFormValue) => {
    this.spinner.show();
    this.executeGetReport();
  };

  private executeGetReport() {
    const request: NewAssignmentRequest = {
      fromDate: this.assignmentListForm.controls.fromDate.value,
      toDate: this.assignmentListForm.controls.toDate.value,
      employeeId: +this.assignmentListForm.controls.recruiter.value.employeeId | 0
    };
    forkJoin([this.assignmentService.getAllRecruiters(), this.assignmentService.getAssignmentsByDateRange(request)])
      .subscribe(([recruiters, result]) => {
        this.recruiters = recruiters as Recruiter[];
        this.recruiters.splice(0, 0, this.defaultRecruiter);
        if (this.initLoad) {
          this.assignmentListForm.get('recruiter').patchValue(this.defaultRecruiter);
        }
        this.initLoad = false;
        this.dataSource.data = result as AssignmentListResponse[];

        this.dataSource.paginator = this.paginator;
        this.subTitle = ' ('+this.dataSource.data.length+' Records)';
        window.scrollTo(0, 0);
        this.spinner.hide();
      },
        error => {
          this.alertService.error(error);
          this.spinner.hide();
        });
  }

  applyFilterOne(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPaginateChange(event) {
    window.scrollTo(0, 0);
  }
}
