import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule} from '@angular/material/tabs';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgxMaskModule } from 'ngx-mask';
import { NgxDataTableModule } from './components/ngx-data-table/ngx-data-table.module';
import { FileUploadModule } from '@iplab/ngx-file-upload';

import { AlertComponent } from './components/alert/alert.component';
import { ReportSubtitleComponent } from './components/report-subtitle/report-subtitle.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ConfirmEqualValidatorDirective } from './directives/confirm-equal-validator.directive';
import { PasswordStrengthComponent } from './components/password-strength/password-strength.component';
import { FormatPhonePipe } from './pipes/format-phone.pipe';
import { UsPhoneFormatDirective } from './directives/us-phone-format.directive';
import { FormatZipCodePipe } from './pipes/format-zip-code.pipe';
import { StripParamFromUrlPipe } from './pipes/strip-param-from-url.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatTabsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatNativeDateModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    MatGridListModule,
    MatSlideToggleModule,
    NgxDataTableModule,
    FileUploadModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [
    AlertComponent,
    ReportSubtitleComponent,
    LoadingComponent,
    ConfirmEqualValidatorDirective,
    PasswordStrengthComponent,
    FormatPhonePipe,
    UsPhoneFormatDirective,
    FormatZipCodePipe,
    StripParamFromUrlPipe
  ],
  exports: [
    FlexLayoutModule,
    ConfirmEqualValidatorDirective,
    AlertComponent,
    ReportSubtitleComponent,
    LoadingComponent,
    PasswordStrengthComponent,
    FormatPhonePipe,
    UsPhoneFormatDirective,
    FormatZipCodePipe,
    MatTableModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatTabsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatMenuModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    NgxMaskModule,
    FileUploadModule,
    NgxDataTableModule
  ],
  providers: [
    FormatPhonePipe,
    FormatZipCodePipe,
    StripParamFromUrlPipe,
    DecimalPipe,
    CurrencyPipe,
    PercentPipe
  ]
})
export class SharedModule { }
