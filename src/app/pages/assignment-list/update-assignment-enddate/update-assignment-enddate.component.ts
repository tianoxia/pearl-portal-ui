import { Component, OnInit, Input, ViewEncapsulation, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AssignmentService, AlertService, AuthenticationService } from 'app/_services';
import { AssignmentListResponse, AssignmentRequest, IApiResponse } from 'app/_models';

export interface UpdateEndDateDialogData {
  assignment: AssignmentListResponse;
  updateEndDateTitle: string;
}

@Component({
  selector: 'app-update-assignment-enddate',
  templateUrl: './update-assignment-enddate.component.html',
  styleUrls: ['./update-assignment-enddate.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateAssignmentEndDateComponent implements OnInit {
  @Input() updateAssignmentEndDateForm: FormGroup;
  assignmentId: number;  
  updateEndDateTitle: string;
  assignment: AssignmentListResponse;
  assignmentStatus: string;
  user: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UpdateEndDateDialogData,
    public dialogRef: MatDialogRef<UpdateAssignmentEndDateComponent>,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private assignmentService: AssignmentService,
    private alertService: AlertService) {
      this.updateAssignmentEndDateForm = formBuilder.group({
        updateEndDateLocation: '',
        updateEndDateSalesPerson: '',
        updateEndDateRecruiter:'',
        startDate: '',
        endDate: ['', [Validators.required]],
        notesTwo: ['', [Validators.required]]
      });
      this.assignment = data.assignment;
      this.assignmentId = data.assignment.assignmentId;
      this.updateEndDateTitle = data.updateEndDateTitle;
      this.updateAssignmentEndDateForm.controls.updateEndDateRecruiter.patchValue(this.assignment.recruiter);
      this.updateAssignmentEndDateForm.controls.updateEndDateSalesPerson.patchValue(this.assignment.salesPerson);
      this.updateAssignmentEndDateForm.controls.updateEndDateLocation.patchValue(this.assignment.locationName);
      this.updateAssignmentEndDateForm.controls.startDate.patchValue(this.assignment.startDate);
      this.updateAssignmentEndDateForm.controls.endDate.patchValue(this.assignment.endDate);
      this.updateAssignmentEndDateForm.controls.notesTwo.patchValue(this.assignment.notes.notes2);
    }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      this.user = this.authService.currentUserValue.employeeName;
  }

  }
  public hasError = (controlName: string) => {
    return this.updateAssignmentEndDateForm.controls[controlName].hasError;
  }
  getErrorMessage(control: string) {
    switch (control) {
      case 'notesTwo': 
        if (this.updateAssignmentEndDateForm.controls.notesTwo.hasError('required')) {
          return 'Notes is required';
        }
        break;
        case 'endDate':
          if (this.updateAssignmentEndDateForm.controls.endDate.hasError('required')) {
            return 'End date is required';
          }
          break;
    }
  }
  public updateAssignmentEndDate() {
    const request = this.setAssignmentRequest() as AssignmentRequest;
      this.assignmentService.updateAssignmentEndDate(this.assignmentId, request)
          .pipe(first())
          .subscribe((response: IApiResponse) => {
            this.router.navigate(['assignment-list'], {queryParams: { message: response.message, action: 'edit' }});            
          },
          error => {
            window.scrollTo(0, 0);
            this.alertService.error(error);
            this.spinner.hide();
          });
      this.dialogRef.close();
  }
  private setAssignmentRequest(): AssignmentRequest {
    const request = new AssignmentRequest();
    request.endDate = this.updateAssignmentEndDateForm.controls.endDate.value;
	  request.notes2 = this.updateAssignmentEndDateForm.controls.notesTwo.value;
	  request.notes2_User = this.user;
    return request;
  }
  public reset(control: string) {
    switch (control) {
      case 'notesTwo': 
        this.updateAssignmentEndDateForm.controls.notesTwo.patchValue('');
        break;
    }
  }
}
