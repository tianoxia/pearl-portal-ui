import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

import { AuthenticationService } from '../../_services';
import { AlertService } from '../../_services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  @ViewChild('emailInput', {
    static: true, read: ElementRef
  }) emailRef: ElementRef;
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    showPassword = false;

    constructor(public authenticationService: AuthenticationService,
                private formBuilder: FormBuilder,
                private route: ActivatedRoute,
                public alertService: AlertService,
                private router: Router,
                public helpDialog: MatDialog,
                private spinner: NgxSpinnerService) {

        if (this.authenticationService.currentUserValue) {
          this.router.navigate(['home']);
        }
       }

       ngOnInit() {
        this.emailRef.nativeElement.focus();
        this.loginForm = this.formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', [Validators.required]]
        });
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
      }
      get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();
    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }
    this.loading = true;
    this.spinner.show();
    this.authenticationService.login(this.loginForm.value)
      .pipe(first())
      .subscribe(
          data => {
            this.alertService.success('Request successfull, please wait..');
            this.returnUrl = this.returnUrl !== '/' ? this.returnUrl : 'home';
            this.router.navigate([this.returnUrl]);
          },
          error => {
              this.spinner.hide();
              this.loading = false;
              this.submitted = false;
              this.alertService.error(error);
              this.loginForm.reset();
            }
          );
        }
        openHelpDialog() {
          const dialogRef = this.helpDialog.open(LoginHelpDialogComponent);
          dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
          });
        }
        togglePassword() {
          this.showPassword = !this.showPassword;
        }
}

@Component({
  selector: 'app-login-help-dialog',
  templateUrl: 'login-help-dialog.component.html',
})
export class LoginHelpDialogComponent {}
