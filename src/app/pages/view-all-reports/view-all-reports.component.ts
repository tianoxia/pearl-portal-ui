import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/_services';
import { NgxSpinnerService } from 'ngx-spinner';

import { PermissionType, Resource } from 'app/_models';

@Component({
  selector: 'app-view-all-reports',
  templateUrl: './view-all-reports.component.html',
  styleUrls: ['./view-all-reports.component.css']
})
export class ViewAllReportsComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService,
    private authService: AuthenticationService, private router: Router) { }

  ngOnInit() {
    if (this.authService.currentUserValue !== null) {
      const perm = this.authService.currentUserValue.employeePermissions;
      if (!perm.find(e => e.resource === Resource.Reports && e.permissionTypes.includes(PermissionType.LIST))) {
        this.router.navigateByUrl("/unauthorized");
      }
    }
    window.scrollTo(0, 0);
    this.spinner.hide();
  }

}
