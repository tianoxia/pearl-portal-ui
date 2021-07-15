import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AlertService, InvoiceReportService } from 'app/_services';
import { InvoiceReportResponse, InvoiceReportRequest } from 'app/_models';

@Component({
  selector: 'app-view-invoices',
  templateUrl: './view-invoices.component.html',
  styleUrls: ['./view-invoices.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ViewInvoicesComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() invoiceReportForm: FormGroup;
  payDate: Date;
  weekEnding: Date;
  floatLabelControl = new FormControl('auto');

  public displayedColumns = ['select', 'invoiceNumber', 'clientName', 'discount', 'amount',
          'expenses', 'invoiceTotal', 'receipt', 'fileName', 'sentDate', 'reportSent'];
  public dataSource = new MatTableDataSource<InvoiceReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder,
    private route: ActivatedRoute,
    private invoiceService: InvoiceReportService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService) {
      this.invoiceReportForm = fb.group({
        floatLabel: this.floatLabelControl,
      });
    }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.payDate = new Date(params.get('paydate'));
      this.weekEnding = new Date(params.get('weekending'));
      const request: InvoiceReportRequest = {
        payPeriodId: +params.get('payperiodid'),
        payDate: this.datePipe.transform(params.get('paydate'), 'yyyy-MM-dd'),
        payFrequency: params.get('payfrequency'),
        weekEnding1: this.datePipe.transform(params.get('weekending'), 'yyyy-MM-dd'),
        weekEnding2: '2021-07-30'
      };
      this.loadData(request);
    });    
  }

  private loadData(request: InvoiceReportRequest) {
    
    this.invoiceService.getInvoiceReport(request)
      .subscribe(invoiceReports => {
        this.dataSource.data = invoiceReports as InvoiceReportResponse[];
        this.dataSource.sort = this.sort;
        this.spinner.hide();
      },
      (error => {
        this.spinner.hide();
        this.alertService.error(error);
      })
    );
  }
  public submitInvoiceReport = (invoiceReportFormValue) => {
    if (this.invoiceReportForm.valid) {
      this.spinner.show();
      
    }
  }
  selection = new SelectionModel<InvoiceReportResponse>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: InvoiceReportResponse): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.invoiceNumber + 1}`;
  }
}
