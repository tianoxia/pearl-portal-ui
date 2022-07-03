import { Component, OnInit, Input, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FileUploadValidators } from '@iplab/ngx-file-upload';
import { first } from 'rxjs/operators';

import { ContractorService, AlertService } from 'app/_services';
import { AnnouncementRequest, IApiResponse } from 'app/_models';
import { contractorStatus } from 'app/constants/contractor-status';

export interface AnnouncementDialogData {
  contractorStatus: string;
  announcementTitle: string;
}
@Component({
  selector: 'app-make-announcement',
  templateUrl: './make-announcement.component.html',
  styleUrls: ['./make-announcement.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MakeAnnouncementComponent implements OnInit {
  @Input() announcementForm: FormGroup;
  statuses = contractorStatus;
  announcementTitle: string;
  private filesControl = new FormControl(null, FileUploadValidators.fileSize(10000000));
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AnnouncementDialogData,
    public dialogRef: MatDialogRef<MakeAnnouncementComponent>,
    formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private contractorService: ContractorService,
    private alertService: AlertService) {
      this.announcementForm = formBuilder.group({
        assignmentStatus: ['Active'],
        employeeType: ['W2'],
        content: ['', [Validators.required]],
        file: this.filesControl
      });
      this.announcementForm.controls.assignmentStatus.patchValue(data.contractorStatus);
      this.announcementTitle = data.announcementTitle;
    }

  ngOnInit() {}
  public hasError = (controlName: string) => {
    return this.announcementForm.controls[controlName].hasError;
  }
  getErrorMessage(control: string) {
    switch (control) {
      case 'content': 
        if (this.announcementForm.controls.content.hasError('required')) {
          return 'Content is required';
        }
        break;
    }
  }
  compareStatuses(o1: any, o2: any) {
    return (o1 == o2);
  }
  public announcement() {
    this.spinner.show();
    const request = this.setAnnouncementRequest() as FormData;
      this.contractorService.createAnnouncement(request)
          .subscribe((response: IApiResponse) => {
            this.spinner.hide();
            this.router.navigate(['contractor-list'], {queryParams: { message: response.message, action: 'Edit' }});            
          },
          error => {
            window.scrollTo(0, 0);
            this.alertService.error(error);
            this.spinner.hide();
          });
      this.dialogRef.close();
  }
  private setAnnouncementRequest(): FormData {
    const formData = new FormData();
    if (this.announcementForm.get('file').value !== null) {
      this.announcementForm.get('file').value.forEach((f) => formData.append('files', f));
    }
    formData.append('assignmentStatus', this.announcementForm.controls.assignmentStatus.value);
    formData.append('employeeType', this.announcementForm.controls.employeeType.value);
    formData.append('content', this.announcementForm.controls.content.value);
    return formData;
  }
  public reset(control: string) {
    switch (control) {
      case 'content': 
        this.announcementForm.controls.content.patchValue('');
        break;
    }
  }
}
