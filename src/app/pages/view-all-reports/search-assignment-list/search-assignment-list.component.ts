import { Component, Input, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AssignmentService, AlertService, AuthenticationService } from 'app/_services';
import { SearchAssignmentResponse, Department, SearchAssignmentRequest } from 'app/_models';
import { contractorStatus } from 'app/constants/contractor-status';

@Component({
  selector: 'app-search-assignment-list',
  templateUrl: './search-assignment-list.component.html',
  styleUrls: ['./search-assignment-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SearchAssignmentListComponent implements OnInit {
  subTitle: string;
  selectedAssignment: SearchAssignmentResponse;
  @ViewChild('assignmentTable', { read: MatSort, static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() assignmentListForm: FormGroup;
  @Input() departments: Department[];
  initLoad: boolean;
  user: string;
  statuses = contractorStatus;
  isAdminClerical: boolean;
  defaultDept: Department = {
    departmentId: 0,
    name: 'All',
    departmentNumber: '0'
  };
  public displayedColumns = ['departmentName', 'clientName', 'contractorName', 'locationName', 'contactName', 'accountingContactName'];
  public dataSource = new MatTableDataSource<SearchAssignmentResponse>();
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
      this.assignmentListForm = fb.group({
        assignmentStatus: 'Active',
        department: this.defaultDept
      });
      this.selectedAssignment = new SearchAssignmentResponse();
    }

  ngOnInit() {
    this.initLoad = true;
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
      if (this.authService.currentUserValue.role === 'Admin'
      || this.authService.currentUserValue.role === 'Clerical') {
        this.spinner.show();
        this.executeGetReport();
      } else {
        this.router.navigateByUrl("/unauthorized");
      }
    }    
  }
  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }
  compareDepartments(o1: any, o2: any) {
    return (o1.name == o2.name && o1.departmentId == o2.departmentId);
  }

  public showAssignmentList = () => {
    this.spinner.show();
    this.executeGetReport();
  };

  private executeGetReport() {
    const request: SearchAssignmentRequest = {
      assignmentStatus: this.assignmentListForm.controls.assignmentStatus.value,
      departmentId: +this.assignmentListForm.controls.department.value.departmentId | 0
    };
    forkJoin([this.assignmentService.getAllDepartments(), this.assignmentService.getAssignmentsByStatusAndDepartment(request)])
      .subscribe(([departments, result]) => {
        this.departments = departments as Department[];
        if (this.initLoad) {
          this.departments.splice(0, 0, this.defaultDept);
          this.assignmentListForm.get('department').patchValue(this.defaultDept);
        }
        this.initLoad = false;
        this.dataSource.data = result as SearchAssignmentResponse[];

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
