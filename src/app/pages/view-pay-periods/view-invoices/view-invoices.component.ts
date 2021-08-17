import { Component, OnInit, ViewChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { FileUploadValidators } from '@iplab/ngx-file-upload';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RowInput } from 'jspdf-autotable'; 


import { AlertService, InvoiceReportService } from 'app/_services';
import { InvoiceReportResponse, InvoiceReportRequest,
  IApiResponse, InvoicePdfResponse, InvoicePdfData, TimesheetReportResponse } from 'app/_models';

@Component({
  selector: 'app-view-invoices',
  templateUrl: './view-invoices.component.html',
  styleUrls: ['./view-invoices.component.css'],
  providers: [CurrencyPipe],
  encapsulation: ViewEncapsulation.None
})
export class ViewInvoicesComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() invoiceReportForm: FormGroup;
  payDate: Date;
  weekEnding: Date;
  payPeriodId: number;
  payFrequency: string;
  selectedInvoice: InvoiceReportResponse;
  img: string;
  floatLabelControl = new FormControl('auto');
  @ViewChild('viewReceiptsDialog', { static: true, read: TemplateRef }) viewFilesRef: TemplateRef<any>;
  private filesControl = new FormControl(null, FileUploadValidators.fileSize(10000000));

  public displayedColumns = ['select', 'invoiceNumber', 'clientName', 'discount', 'amount',
          'expenses', 'invoiceTotal', 'receipts', 'fileName', 'sentDate', 'reportSent'];
  public dataSource = new MatTableDataSource<InvoiceReportResponse>();
  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  constructor(public alertService: AlertService,
    fb: FormBuilder,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private invoiceService: InvoiceReportService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private spinner: NgxSpinnerService) {
      this.invoiceReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        emailBody: '',
        emailCc: '',
        emailSubject: '',
        files: this.filesControl
      });
    }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.show();
    this.route.queryParamMap.subscribe(params => {
      this.payDate = new Date(params.get('paydate'));
      this.weekEnding = new Date(params.get('weekending'));
      this.payPeriodId = +params.get('payperiodid');
      this.payFrequency = params.get('payfrequency');
      const request: InvoiceReportRequest = {
        payPeriodId: +params.get('payperiodid'),
        payDate: this.datePipe.transform(params.get('paydate'), 'yyyy-MM-dd'),
        payFrequency: params.get('payfrequency'),
        weekEnding1: this.datePipe.transform(params.get('weekending'), 'yyyy-MM-dd'),
        weekEnding2: '2021-08-30',
        isRequestFromInvoicesReport: false
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
      this.selection.selected.forEach(x => {
        const request: InvoiceReportRequest = {
          payPeriodId: this.payPeriodId,
          payDate: this.datePipe.transform(this.payDate, 'yyyy-MM-dd'),
          payFrequency: this.payFrequency,
          weekEnding1: this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'),
          invoiceGroupId: x.invoiceGroupId,
          weekEnding2: '2021-08-30',
          isRequestFromInvoicesReport: true
        };        
        this.invoiceService.getLogoImage().subscribe(res => {
          const reader = new FileReader();
          reader.onloadend = () => {
            forkJoin([this.invoiceService.printInvoiceReport(request), this.invoiceService.printTimesheetReport(request)])
              .subscribe(([invoices, timesheets]) => {
                const invoicePdfSource = invoices as InvoicePdfResponse[];
                const timesheetSource = timesheets as TimesheetReportResponse[];
                this.img = reader.result.toString();
                //const doc = new jsPDF();
                const formData = new FormData();
                const blob = this.generateInvoicePdfReport(invoicePdfSource, timesheetSource, reader);
                formData.append('files', blob);
                formData.append('invoiceGroupId', x.invoiceGroupId.toString());
                this.invoiceService.emailInvoices(formData)
                .subscribe((response: IApiResponse) => {
                  this.alertService.success(response.message);
                  window.scrollTo(0, 0);
                  this.spinner.hide();
                },
                error => {
                  window.scrollTo(0, 0);
                  this.alertService.error(error);
                  this.spinner.hide();
                });
              },
              (error => {
                this.spinner.hide();
                this.alertService.error(error);
              })
            );            
          }
          reader.readAsDataURL(res);      
        });
      });      
    }
  }
  bodyRows(details: InvoicePdfData[]) {
    const body = [];
    details.forEach(detail => {
      body.push({
        name: detail.name,
        expense: detail.expenses.toFixed(2),
        hours: detail.hours.toFixed(2),        
        billRate: detail.billRate.toFixed(2),
        regularAmount: detail.regularAmount.toFixed(2),
        otHours: detail.otHours.toFixed(2),
        otBillRate: detail.otBillRate.toFixed(2),
        otAmount: detail.otAmount.toFixed(2),
        dtHours: detail.dtHours.toFixed(2),
        dtBillRate: detail.dtBillRate.toFixed(2),
        dtAmount: detail.dtAmount.toFixed(2),
        discount: detail.discount.toFixed(2),
        total: this.currencyPipe.transform(detail.invoiceTotal.toFixed(2), 'USD')
      });
    });
    return body;
  }

  headRows(): RowInput[] {
    return [
      { name: 'Name', expense: 'Expense', hours: 'Reg\nHours', billRate: 'Bill\nRate',
      regularAmount: 'Reg\nAmount', otHours: 'OT\nHours', otBillRate: 'OT\nRate', otAmount: 'OT\nAmount',
      dtHours: 'DT\nHours', dtBillRate: 'DT\nRate', dtAmount: 'DT\nAmount', discount: 'Discount', total: 'Total' }
    ];
  }
  generateInvoicePdfReport(reports: InvoicePdfResponse[], timesheets: TimesheetReportResponse[], reader: FileReader): Blob {
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';
    const freq = this.payFrequency;
    const wk = this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy');
    if (reports.length > 0) {
      reports.forEach(report => {
        // Header
        const image = reader.result.toString();
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'bold');
        doc.text('Avery Partners, Inc.', 21, 22);
        doc.text('Invoice', 100, 21);
        doc.text('1805 Old Alabama Road,Suite 200', 21, 27);
        doc.text('Roswell, GA 30076-2230', 21, 32);
        doc.text('Phone: 770.642.6100 | TF: 1.888.966.0214 | Fax: 678.367.4603', 21, 37);
        doc.setFont('Helvetica', '300');
        doc.setFontSize(8);
        doc.addImage(image, 'GIF', 10, 15, 10, 10);

        autoTable(doc, {
          theme: 'grid',
          startY: 53,
          showHead: 'never',
          tableLineWidth: 0.3,
          tableLineColor: '#000000',
          tableWidth: 110,
          body: this.leftGroupHeaderBodyRows(report),
          alternateRowStyles: { fillColor: '#ffffff'},
          bodyStyles: { fontStyle: 'bold', fontSize: 12 },
          didDrawPage: function (data) {
            doc.setFontSize(8);
            doc.setFont('Helvetica', 'normal');
            doc.text('Re: '.concat(freq).concat(' Invoice for Week Ending ').concat(wk), 16, 50);
          }
        });
        autoTable(doc, {
          theme: 'grid',
          showHead: 'never',
          startY: 53,
          tableLineWidth: 0.3,
          tableLineColor: '#000000',
          body: this.rightGroupHeaderBodyRows(report),
          alternateRowStyles: { fillColor: '#ffffff'},
          bodyStyles: { fontStyle: 'bold', fontSize: 12, lineColor: '#000000' },
          margin: { left: 110 }
        });
        autoTable(doc, {
          headStyles: {
            fontSize: 8,
            valign: 'bottom'
          },
          startY: 90,
          head: this.headRows(),
          body: this.bodyRows(report.invoiceDetails),
          bodyStyles: {
            fontSize: 8
          },
          footStyles: {
            fillColor: [22, 160, 133], fontSize: 8
          },
          showFoot: 'lastPage',
          foot: this.footerRows(report),
          didDrawPage: function (data) {              
            let str = 'Page ' + doc.getNumberOfPages();
            if (typeof doc.putTotalPages === 'function') {
              str = str + ' of ' + totalPagesExp;
            }
            doc.setFontSize(10);    
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
          }
        });
        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.setFont('Arial', 'bolditalic');
        doc.text('Please notice the change in the payment address. Send all payments to:\n\nAvery Partners, Inc\n1805 Old Alabama Rd, Suite 200\nRoswell, GA 30076', 15, finalY + 15);
        doc.addPage();
        if (timesheets.length > 0) {
          timesheets.forEach(ts => {
            // Header
            const image = reader.result.toString();
            doc.setFontSize(15);
            doc.setFont('Arial', 'bold');
            doc.text('Timesheet', 100, 21);
            doc.setFontSize(8);
            doc.addImage(image, 'GIF', 10, 15, 61, 10);

            autoTable(doc, {
              theme: 'grid',
              startY: 33,
              showHead: 'never',
              tableLineWidth: 0.3,
              tableLineColor: '#000000',
              body: this.leftTimesheetGroupHeaderBodyRows(ts),
              alternateRowStyles: { fillColor: '#ffffff'},
              bodyStyles: { fontStyle: 'bold', fontSize: 12 }
            });
            autoTable(doc, {
              headStyles: {
                fontSize: 9,
                valign: 'bottom'
              },
              startY: 90,
              head: this.timesheetHeadRows(),
              body: this.timesheetBodyRows(ts),
              bodyStyles: {
                fontSize: 9
              },
              footStyles: {
                fillColor: [22, 160, 133], fontSize: 9
              },
              showFoot: 'lastPage',
              foot: this.timesheetFooterRows(ts),
              didDrawPage: function (data) {              
                let str = 'Page ' + doc.getNumberOfPages();
                if (typeof doc.putTotalPages === 'function') {
                  str = str + ' of ' + totalPagesExp;
                }
                doc.setFontSize(10);    
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
              }
            });
            doc.addPage();
          });
        }
        
      });
      doc.deletePage(doc.getNumberOfPages());
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp); 
      }
    }
    return doc.output('blob');
  }
  leftGroupHeaderBodyRows(report: InvoicePdfResponse) {
    return [{ content: 'Bill To : ' + report.clientName }];
  }
  rightGroupHeaderBodyRows(report: InvoicePdfResponse) {
    return [
      { content: 'Invoice #: ' + report.invoiceNumber },
      { content: 'Date: ' + this.datePipe.transform(new Date(), 'MM/dd/yyyy') },
      { content: 'P.O. No.: ' + (report.purchaseOrderNo == 0 ? '' : report.purchaseOrderNo) },
      { content: 'Term: ' + report.term } 
    ];
  }

  footerRows(report: InvoicePdfResponse) {
    return [
      { name: 'Grand Total', expense: (report.invoiceDetails.map(a => a.expenses).reduce(function(a, b)
      {
        return a + b;
      })).toFixed(2), hours: '', billRate: '',
      regularAmount: (report.invoiceDetails.map(a => a.regularAmount).reduce(function(a, b)
      {
        return a + b;
      })).toFixed(2), otHours: '', otRate: '', otAmount: (report.invoiceDetails.map(a => a.otAmount).reduce(function(a, b)
      {
        return a + b;
      })).toFixed(2),
      dtHours: '', dtRate: '', dtAmount: (report.invoiceDetails.map(a => a.dtAmount).reduce(function(a, b)
      {
        return a + b;
      })).toFixed(2), discount: (report.invoiceDetails.map(a => a.discount).reduce(function(a, b)
      {
        return a + b;
      })).toFixed(2), total: this.currencyPipe.transform((report.invoiceDetails.map(a => a.invoiceTotal).reduce(function(a, b)
      {
        return a + b;
      })).toFixed(2), 'USD') }
    ];
  }
  timesheetHeadRows(): RowInput[] {
    return [
      { date: 'Date', day: 'Day', workStart: 'Work Start', lunchOut: 'Lunch Out',
      lunchIn: 'Lunch In', workEnd: 'Work End', totalHours: 'Total Hours' }
    ];
  }
  timesheetBodyRows(report: TimesheetReportResponse) {
    const body = [];
    body.push({
      date: this.datePipe.transform(report.sundayDate, 'MM/dd/yyyy'),
      day: 'Sunday',
      workStart: report.sundayStart,        
      lunchOut: report.sundayLunchOut,
      lunchIn: report.sundayLunchIn,
      workEnd: report.sundayEnd,
      totalHours: report.sundayHours
    });
    body.push({
      date: this.datePipe.transform(report.mondayDate, 'MM/dd/yyyy'),
      day: 'Monday',
      workStart: report.mondayStart,        
      lunchOut: report.mondayLunchOut,
      lunchIn: report.mondayLunchIn,
      workEnd: report.mondayEnd,
      totalHours: report.mondayHours
    });
    body.push({
      date: this.datePipe.transform(report.tuesdayDate, 'MM/dd/yyyy'),
      day: 'Tuesday',
      workStart: report.tuesdayStart,        
      lunchOut: report.tuesdayLunchOut,
      lunchIn: report.tuesdayLunchIn,
      workEnd: report.tuesdayEnd,
      totalHours: report.tuesdayHours
    });
    body.push({
      date: this.datePipe.transform(report.wednesdayDate, 'MM/dd/yyyy'),
      day: 'Wednesday',
      workStart: report.wednesdayStart,        
      lunchOut: report.wednesdayLunchOut,
      lunchIn: report.wednesdayLunchIn,
      workEnd: report.wednesdayEnd,
      totalHours: report.wednesdayHours
    });
    body.push({
      date: this.datePipe.transform(report.thursdayDate, 'MM/dd/yyyy'),
      day: 'Thursday',
      workStart: report.thursdayStart,        
      lunchOut: report.thursdayLunchOut,
      lunchIn: report.thursdayLunchIn,
      workEnd: report.thursdayEnd,
      totalHours: report.thursdayHours
    });
    body.push({
      date: this.datePipe.transform(report.fridayDate, 'MM/dd/yyyy'),
      day: 'Friday',
      workStart: report.fridayStart,        
      lunchOut: report.fridayLunchOut,
      lunchIn: report.fridayLunchIn,
      workEnd: report.fridayEnd,
      totalHours: report.fridayHours
    });
    body.push({
      date: this.datePipe.transform(report.saturdayDate, 'MM/dd/yyyy'),
      day: 'Saturday',
      workStart: report.saturdayStart,        
      lunchOut: report.saturdayLunchOut,
      lunchIn: report.saturdayLunchIn,
      workEnd: report.saturdayEnd,
      totalHours: report.saturdayHours
    });
    return body;
  }
  leftTimesheetGroupHeaderBodyRows(report: TimesheetReportResponse) {
    return [
      { content: 'WeekEnding: ' + this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy') },
      { content: 'Name: ' + report.contractorName },
      { content: 'Assignment: ' + report.clientName },
      { content: 'Notes: ' + report.projectName }
    ];
  }

  timesheetFooterRows(report: TimesheetReportResponse) {
    return [
      { date: '', day: '', workStart: '', lunchOut: '', lunchIn: '', workEnd: 'Weekly Hours:\n\nBill Rate(hourly):\n\nApprover:\n\nApproved Date:',
      totalHours: (report.sundayHours+report.mondayHours+
        report.tuesdayHours+report.wednesdayHours+report.thursdayHours+report.fridayHours+
        report.saturdayHours).toFixed(2).toString()+'\n\n'+this.currencyPipe.transform(report.billRate.toFixed(2), 'USD')+'\n\n'
        +report.approverName+'\n\n'+this.datePipe.transform(report.approveTime, 'MM/dd/yyyy h:mm a') }
    ];
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

  viewReceipts(invoiceGroupId: number) {
    this.selectedInvoice = this.dataSource.data.find(i => i.invoiceGroupId === invoiceGroupId);
    this.openViewReceiptsDialog(this.viewFilesRef);
    return false;
  }

  openViewReceiptsDialog(viewReceiptsDialog) {
    this.dialog.open(viewReceiptsDialog, {
      autoFocus: true,
      width: '400px',
      disableClose: true
    });    
    return false;
  }

  public hasError = (controlName: string) => {
    return this.invoiceReportForm.controls[controlName].hasError;
  }

  getErrorMessage(control: string) {
    switch (control) {
      case 'firstname':
        break;
      case 'emailSubject': 
        break;
      case 'emailBody':
        break;
    }
    return '';
  }

  reset(control: string) {
    switch (control) {
      case 'emailcc': 
        this.invoiceReportForm.controls.emailCc.patchValue('');
        break;
      case 'emailsubject':
        this.invoiceReportForm.controls.emailSubject.patchValue('');
        break;
      case 'emailbody':
        this.invoiceReportForm.controls.emailBody.patchValue('');
        break;
    }
  }
}
