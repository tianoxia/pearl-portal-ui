import { Component, OnInit, ViewChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { FileUploadValidators } from '@iplab/ngx-file-upload';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RowInput } from 'jspdf-autotable'; 


import { AlertService, InvoiceReportService } from 'app/_services';
import { InvoiceReportResponse, InvoiceReportRequest, ExpenseReportResponse,
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
    private spinner: NgxSpinnerService,
    private router: Router) {
      this.invoiceReportForm = fb.group({
        floatLabel: this.floatLabelControl,
        emailBody: '',
        emailCc: ['', [Validators.email]],
        emailSubject: '',
        invoicePdf: this.filesControl,
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
      if (this.payPeriodId > 0) {
        this.loadData(request);
      } else {
        this.router.navigate(['/view-pay-periods']);
      }      
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
      if (this.selection.selected.length > 0) {
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
              forkJoin([this.invoiceService.printInvoiceReport(request), 
                this.invoiceService.printTimesheetReport(request),
                this.invoiceService.printExpenseReport(request)])
                .subscribe(([invoices, timesheets, expenses]) => {
                  const invoicePdfSource = invoices as InvoicePdfResponse[];
                  const timesheetSource = timesheets as TimesheetReportResponse[];
                  const expenseSource = expenses as ExpenseReportResponse[];
                  this.img = reader.result.toString();
                  const formData = new FormData();
                  const blob = this.generateInvoicePdfReport(invoicePdfSource, timesheetSource, expenseSource, reader);
                  formData.append('weekEnding1', this.datePipe.transform(this.weekEnding, 'yyyy-MM-dd'));
                  formData.append('payFrequency', this.payFrequency);
                  formData.append('payPeriodId', this.payPeriodId.toString());
                  formData.append('invoiceGroupId', x.invoiceGroupId.toString());
                  formData.append('clientName', x.clientName);
                  formData.append('emailCC', this.invoiceReportForm.controls.emailCc.value);
                  formData.append('emailSubject', this.invoiceReportForm.controls.emailSubject.value);
                  formData.append('emailBody', this.invoiceReportForm.controls.emailBody.value);
                  formData.append('invoicePdf', blob, 'invoice'.concat(x.invoiceGroupId.toString()).concat('.pdf'));
                  if (this.invoiceReportForm.get('files').value !== null) {
                    this.invoiceReportForm.get('files').value.forEach((f) => formData.append('files', f));
                  }
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
      } else {
        window.scrollTo(0, 0);
        this.alertService.error('Please select at least one invoice to proceed.');
      }     
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

  headRows(hasDT: boolean, hasDiscount: boolean): RowInput[] {
    let header = {};
    header = { name: 'Name', hours: 'Reg\nHours', billRate: 'Bill\nRate',
    regularAmount: 'Reg\nAmount', expense: 'Expense', otHours: 'OT\nHours', otBillRate: 'OT\nRate', otAmount: 'OT\nAmount' };
    if (hasDT) {
      header['dtHours'] = 'DT\nHours';
      header['dtBillRate'] = 'DT\nRate';
      header['dtAmount'] = 'DT\nAmount';
    }
    if (hasDiscount) {
      header['discount'] = 'Discount';
    }
    header['total'] = 'Total';
    return [header];
  }

  generateInvoicePdfReport(reports: InvoicePdfResponse[], timesheets: TimesheetReportResponse[],
    expenses: ExpenseReportResponse[], reader: FileReader): Blob {
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';
    const freq = this.payFrequency;
    const wk = this.datePipe.transform(this.weekEnding, 'MM/dd/yyyy');
    if (reports.length > 0) {
      reports.forEach(report => {
        const hasDT = report.invoiceDetails.map(a => a.dtHours).reduce(function(a, b)
        {
          return a + b;
        }) > 0;
        const hasDiscount = report.invoiceDetails.map(a => a.discount).reduce(function(a, b)
        {
          return a + b;
        }) > 0;
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
        doc.addImage(image, 'GIF', 10, 15, 20, 10);

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
          head: this.headRows(hasDT, hasDiscount),
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
            //const image = reader.result.toString();
            doc.setFontSize(15);
            doc.setFont('Arial', 'bold');
            doc.text('Avery Partners, Inc.', 21, 22);
            doc.text('Timesheet', 100, 21);
            doc.setFontSize(8);
            doc.addImage(image, 'GIF', 10, 15, 20, 10);

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
              startY: 120,
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
        if (expenses.length > 0) {
          expenses.forEach(exp => {
            doc.setFontSize(15);
            doc.setFont('Arial', 'bold');
            doc.text('Avery Partners, Inc.', 21, 22);
            doc.text('Expense', 100, 21);
            doc.setFontSize(8);
            doc.addImage(image, 'GIF', 10, 15, 20, 10);

            autoTable(doc, {
              theme: 'grid',
              startY: 33,
              showHead: 'never',
              tableLineWidth: 0.3,
              tableLineColor: '#000000',
              body: this.leftTimesheetGroupHeaderBodyRows(exp),
              alternateRowStyles: { fillColor: '#ffffff'},
              bodyStyles: { fontStyle: 'bold', fontSize: 12 }
            });
            autoTable(doc, {
              headStyles: {
                fontSize: 9,
                valign: 'bottom'
              },
              startY: 120,
              head: this.expenseHeadRows(),
              body: this.expenseBodyRows(exp),
              bodyStyles: {
                fontSize: 9
              },
              footStyles: {
                fillColor: [22, 160, 133], fontSize: 9
              },
              showFoot: 'lastPage',
              foot: this.expenseFooterRows(exp),
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
  expenseHeadRows(): RowInput[] {
    return [
      { date: 'Date', day: 'Day', hotel: 'Hotel', travel: 'Travel', marketing: 'Marketing',
        meals: 'Meals', mileage: 'Mileage', phone: 'Phone', other: 'Other', totalExpenses: 'Total Expense' }
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
  expenseBodyRows(report: ExpenseReportResponse) {
    const body = [];
    body.push({
      date: this.datePipe.transform(report.sundayDate, 'MM/dd/yyyy'),
      day: 'Sunday',
      hotel: report.sundayHotel.toFixed(2),
      travel: report.sundayTravel.toFixed(2),
      marketing: report.sundayMarketing.toFixed(2),
      meals: report.sundayMeals.toFixed(2),
      mileage: report.sundayMileage.toFixed(2),
      phone: report.sundayPhone.toFixed(2),
      other: report.sundayOther.toFixed(2),
      totalExpenses: report.sundayExpenses.toFixed(2)
    });
    body.push({
      date: this.datePipe.transform(report.mondayDate, 'MM/dd/yyyy'),
      day: 'Monday',
      hotel: report.mondayHotel.toFixed(2),
      travel: report.mondayTravel.toFixed(2),
      marketing: report.mondayMarketing.toFixed(2),
      meals: report.mondayMeals.toFixed(2),
      mileage: report.mondayMileage.toFixed(2),
      phone: report.mondayPhone.toFixed(2),
      other: report.mondayOther.toFixed(2),
      totalExpenses: report.mondayExpenses.toFixed(2)
    });
    body.push({
      date: this.datePipe.transform(report.tuesdayDate, 'MM/dd/yyyy'),
      day: 'Tuesday',
      hotel: report.tuesdayHotel.toFixed(2),
      travel: report.tuesdayTravel.toFixed(2),
      marketing: report.tuesdayMarketing.toFixed(2),
      meals: report.tuesdayMeals.toFixed(2),
      mileage: report.tuesdayMileage.toFixed(2),
      phone: report.tuesdayPhone.toFixed(2),
      other: report.tuesdayOther.toFixed(2),
      totalExpenses: report.tuesdayExpenses.toFixed(2)
    });
    body.push({
      date: this.datePipe.transform(report.wednesdayDate, 'MM/dd/yyyy'),
      day: 'Wednesday',
      hotel: report.wednesdayHotel.toFixed(2),
      travel: report.wednesdayTravel.toFixed(2),
      marketing: report.wednesdayMarketing.toFixed(2),
      meals: report.wednesdayMeals.toFixed(2),
      mileage: report.wednesdayMileage.toFixed(2),
      phone: report.wednesdayPhone.toFixed(2),
      other: report.wednesdayOther.toFixed(2),
      totalExpenses: report.wednesdayExpenses.toFixed(2)
    });
    body.push({
      date: this.datePipe.transform(report.thursdayDate, 'MM/dd/yyyy'),
      day: 'Thursday',
      hotel: report.thursdayHotel.toFixed(2),
      travel: report.thursdayTravel.toFixed(2),
      marketing: report.thursdayMarketing.toFixed(2),
      meals: report.thursdayMeals.toFixed(2),
      mileage: report.thursdayMileage.toFixed(2),
      phone: report.thursdayPhone.toFixed(2),
      other: report.thursdayOther.toFixed(2),
      totalExpenses: report.thursdayExpenses.toFixed(2)
    });
    body.push({
      date: this.datePipe.transform(report.fridayDate, 'MM/dd/yyyy'),
      day: 'Friday',
      hotel: report.fridayHotel.toFixed(2),
      travel: report.fridayTravel.toFixed(2),
      marketing: report.fridayMarketing.toFixed(2),
      meals: report.fridayMeals.toFixed(2),
      mileage: report.fridayMileage.toFixed(2),
      phone: report.fridayPhone.toFixed(2),
      other: report.fridayOther.toFixed(2),
      totalExpenses: report.fridayExpenses.toFixed(2)
    });
    body.push({
      date: this.datePipe.transform(report.saturdayDate, 'MM/dd/yyyy'),
      day: 'Saturday',
      hotel: report.saturdayHotel.toFixed(2),
      travel: report.saturdayTravel.toFixed(2),
      marketing: report.saturdayMarketing.toFixed(2),
      meals: report.saturdayMeals.toFixed(2),
      mileage: report.saturdayMileage.toFixed(2),
      phone: report.saturdayPhone.toFixed(2),
      other: report.saturdayOther.toFixed(2),
      totalExpenses: report.saturdayExpenses.toFixed(2)
    });
    return body;
  }
  leftTimesheetGroupHeaderBodyRows(report: any) {
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
  expenseFooterRows(report: ExpenseReportResponse) {
    return [
      { date: '', day: '', hotel: '', travel: '', marketing: '', meals: '', mileage: '', phone: '', other: 'Weekly Expenses:\n\nApprover:\n\nApproved Date:', 
      totalExpenses: '\n'+report.weeklyTotalExpense.toFixed(2).toString()+'\n\n'
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
      case 'emailCc':
        return 'Email must be a valid email address';
      case 'emailSubject': 
        break;
      case 'emailBody':
        break;
    }
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

  navigateViewInvoice(invoiceGroupId: number) {

  }
}
