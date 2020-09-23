import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { AccountManagementComponent } from './account-management.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AccountManagementComponent,
    AccountProfileComponent,
    MyProfileComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [CurrencyPipe]
})
export class AccountManagementModule { }
