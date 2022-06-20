import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RowInput } from 'jspdf-autotable';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { InvoiceReportService, AlertService, ExportService } from 'app/_services';
import { InvoicePdfResponse, InvoicePdfData, TimesheetReportResponse,
  InvoiceReportRequest, PayFileRequest, PayFileResponse } from 'app/_models';
import { AddEditPayPeriodComponent } from 'app/pages/view-pay-periods/add-edit-pay-period/add-edit-pay-period.component';

@Component({
  selector: 'app-weekly-pay-period-dashboard',
  templateUrl: './weekly-pay-period-dashboard.component.html',
  styleUrls: ['./weekly-pay-period-dashboard.component.css'],
  providers: [CurrencyPipe],
  encapsulation: ViewEncapsulation.None
})
export class WeeklyPayPeriodDashboardComponent implements OnInit {
  weekEndings: Date[] = [];
  payDate: Date;
  payType: string;
  isReportClick: boolean;
  isInvoiceClick: boolean;
  isPayFileClick: boolean;
  pageType: string;
  payPeriodId: number;
  payFileData: PayFileResponse[];
  selected: Date;
  constructor(public alertService: AlertService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private invoiceService: InvoiceReportService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private route: ActivatedRoute,
    private router: Router) { }
  back(): void {
    this.router.navigate(['view-pay-periods/pay-period-dashboard/weekly-pay-periods'], { queryParams: { pagetype: this.pageType } });
  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.queryParamMap.subscribe(params => {
      this.payType = params.get('paytype');
      this.pageType = params.get('pagetype');
      this.payPeriodId = +params.get('payperiodid');
      this.payDate = new Date(params.get('paydate'));
      this.weekEndings.push(new Date(params.get('weekending')));
      this.selected = this.weekEndings[0];
      if (this.pageType === 'invoice') {
        this.isInvoiceClick = true;
      } else if (this.pageType === 'report') {
        this.isReportClick = true;
      } else if (this.pageType === 'payfile') {
        this.isPayFileClick = true;
      }
    });
  }
  downloadPermInvoiceReport() {
    this.spinner.show();
    this.invoiceService.getLogoImage().subscribe(res => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const request: InvoiceReportRequest = {
          payPeriodId: this.payPeriodId,
          payDate: this.datePipe.transform(this.payDate, 'yyyy-MM-dd'),
          payFrequency: this.payType,
          weekEnding1: this.datePipe.transform(this.selected, 'yyyy-MM-dd'),
          weekEnding2: '2021-07-30',
          isRequestFromInvoicesReport: false
        };
        this.invoiceService.printPermInvoiceReport(request)
          .subscribe((reports: InvoicePdfResponse[]) => {
            this.generateInvoicePdfReport(reports, reader, true);
            this.spinner.hide();
          },
            (error => {
              this.spinner.hide();
              this.alertService.error(error);
            })
          );
      };
      reader.readAsDataURL(res);
    });
  }
  downloadInvoiceReport() {
    this.spinner.show();
    this.invoiceService.getLogoImage().subscribe(res => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const request: InvoiceReportRequest = {
          payPeriodId: this.payPeriodId,
          payDate: this.datePipe.transform(this.payDate, 'yyyy-MM-dd'),
          payFrequency: this.payType,
          weekEnding1: this.datePipe.transform(this.selected, 'yyyy-MM-dd'),
          weekEnding2: '2021-07-30',
          isRequestFromInvoicesReport: false
        };
        this.invoiceService.printInvoiceReport(request)
          .subscribe((reports: InvoicePdfResponse[]) => {
            this.generateInvoicePdfReport(reports, reader, false);
            this.spinner.hide();
          },
            (error => {
              this.spinner.hide();
              this.alertService.error(error);
            })
          );
      };
      reader.readAsDataURL(res);
    });
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

  permBodyRows(details: InvoicePdfData[]) {
    const body = [];
    details.forEach(detail => {
      body.push({
        name: detail.name,
        rate: detail.billRate.toFixed(2),
        description: detail.position,
        total: this.currencyPipe.transform(detail.invoiceTotal.toFixed(2), 'USD')
      });
    });
    return body;
  }

  headRows(hasDT: boolean, hasDiscount: boolean): RowInput[] {
    let header = {};
    header = {
      name: 'Name', hours: 'Reg\nHours', billRate: 'Bill\nRate',
      regularAmount: 'Reg\nAmount', expense: 'Expense', otHours: 'OT\nHours', otBillRate: 'OT\nRate', otAmount: 'OT\nAmount'
    };
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

  permHeadRows(): RowInput[] {
    return [
      { name: 'Name', rate: 'Rate', description: 'Description', total: 'Total' }
    ]
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

  footerRows(report: InvoicePdfResponse, isPermInvoice: boolean) {
    return isPermInvoice ? [
      {
        name: 'Grand Total', expense: (report.invoiceDetails.map(a => a.expenses).reduce(function (a, b) {
          return a + b;
        })).toFixed(2),
        rate: (report.invoiceDetails.map(a => a.billRate).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), discount: (report.invoiceDetails.map(a => a.discount).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), total: this.currencyPipe.transform((report.invoiceDetails.map(a => a.invoiceTotal).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), 'USD')
      }
    ] : [
      {
        name: 'Grand Total', hours: '', billRate: '',
        regularAmount: (report.invoiceDetails.map(a => a.regularAmount).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), expense: (report.invoiceDetails.map(a => a.expenses).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), otHours: '', otRate: '', otAmount: (report.invoiceDetails.map(a => a.otAmount).reduce(function (a, b) {
          return a + b;
        })).toFixed(2),
        dtHours: '', dtRate: '', dtAmount: (report.invoiceDetails.map(a => a.dtAmount).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), discount: (report.invoiceDetails.map(a => a.discount).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), total: this.currencyPipe.transform((report.invoiceDetails.map(a => a.invoiceTotal).reduce(function (a, b) {
          return a + b;
        })).toFixed(2), 'USD')
      }
    ];
  }
  generateInvoicePdfReport(reports: InvoicePdfResponse[], reader: FileReader, isPermInvoice: boolean): void {
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';
    const freq = this.payType;
    const wk = this.datePipe.transform(this.selected, 'MM/dd/yyyy');
    if (reports.length > 0) {
      reports.forEach(report => {
        const hasDT = report.invoiceDetails.map(a => a.dtHours).reduce(function (a, b) {
          return a + b;
        }) > 0;
        const hasDiscount = report.invoiceDetails.map(a => a.discount).reduce(function (a, b) {
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
          alternateRowStyles: { fillColor: '#ffffff' },
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
          alternateRowStyles: { fillColor: '#ffffff' },
          bodyStyles: { fontStyle: 'bold', fontSize: 12, lineColor: '#000000' },
          margin: { left: 110 }
        });
        autoTable(doc, {
          headStyles: {
            fontSize: 8,
            valign: 'bottom'
          },
          startY: 90,
          head: isPermInvoice ? this.permHeadRows() : this.headRows(hasDT, hasDiscount),
          body: isPermInvoice ? this.permBodyRows(report.invoiceDetails) : this.bodyRows(report.invoiceDetails),
          bodyStyles: {
            fontSize: 8
          },
          footStyles: {
            fillColor: [22, 160, 133], fontSize: 8
          },
          showFoot: 'lastPage',
          foot: this.footerRows(report, isPermInvoice),
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
      });
      doc.deletePage(doc.getNumberOfPages());
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }
      doc.save('invoice.pdf');
    }
  }
  downloadTimesheetReport() {
    this.spinner.show();
    this.invoiceService.getLogoImage().subscribe(res => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const request: InvoiceReportRequest = {
          payPeriodId: this.payPeriodId,
          payDate: this.datePipe.transform(this.payDate, 'yyyy-MM-dd'),
          payFrequency: this.payType,
          weekEnding1: this.datePipe.transform(this.selected, 'yyyy-MM-dd'),
          weekEnding2: '2021-07-30',
          isRequestFromInvoicesReport: false
        };
        this.invoiceService.printTimesheetReport(request)
          .subscribe((reports: TimesheetReportResponse[]) => {
            this.generateTimesheetPdfReport(reports, reader);
            this.spinner.hide();
          },
            (error => {
              this.spinner.hide();
              this.alertService.error(error);
            })
          );
      };
      reader.readAsDataURL(res);
    });
  }
  generateTimesheetPdfReport(reports: TimesheetReportResponse[], reader: FileReader): void {
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';
    const freq = this.payType;
    const wk = this.datePipe.transform(this.selected, 'MM/dd/yyyy');
    if (reports.length > 0) {
      reports.forEach(report => {
        // Header
        const image = reader.result.toString();
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
          body: this.leftTimesheetGroupHeaderBodyRows(report),
          alternateRowStyles: { fillColor: '#ffffff' },
          bodyStyles: { fontStyle: 'bold', fontSize: 12 }
        });

        autoTable(doc, {
          headStyles: {
            fontSize: 9,
            valign: 'bottom'
          },
          startY: 90,
          head: this.timesheetHeadRows(),
          body: this.timesheetBodyRows(report),
          bodyStyles: {
            fontSize: 9
          },
          footStyles: {
            fillColor: [22, 160, 133], fontSize: 9
          },
          showFoot: 'lastPage',
          foot: this.timesheetFooterRows(report),
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
      doc.deletePage(doc.getNumberOfPages());
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }
      doc.save('timesheet.pdf');
    }
  }
  timesheetHeadRows(): RowInput[] {
    return [
      {
        date: 'Date', day: 'Day', workStart: 'Work Start', lunchOut: 'Lunch Out',
        lunchIn: 'Lunch In', workEnd: 'Work End', totalHours: 'Total Hours'
      }
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
      { content: 'WeekEnding: ' + this.datePipe.transform(this.selected, 'MM/dd/yyyy') },
      { content: 'Name: ' + report.contractorName },
      { content: 'Assignment: ' + report.clientName },
      { content: 'Notes: ' + report.projectName }
    ];
  }

  timesheetFooterRows(report: TimesheetReportResponse) {
    return [
      {
        date: '', day: '', workStart: '', lunchOut: '', lunchIn: '', workEnd: 'Weekly Hours:\n\nBill Rate(hourly):\n\nApprover:\n\nApproved Date:',
        totalHours: (report.sundayHours + report.mondayHours +
          report.tuesdayHours + report.wednesdayHours + report.thursdayHours + report.fridayHours +
          report.saturdayHours).toFixed(2).toString() + '\n\n' + this.currencyPipe.transform(report.billRate.toFixed(2), 'USD') + '\n\n'
          + report.approverName + '\n\n' + this.datePipe.transform(report.approveTime, 'MM/dd/yyyy h:mm a')
      }
    ];
  }
  editPayPeriod() {
    const modalref = this.dialog.open(AddEditPayPeriodComponent, {
      panelClass: 'update-enddate-dialog',
      maxWidth: window.innerWidth < 600 ? '90vw' : '80vw',
      data: {
        payPeriodId: this.payPeriodId,
        payDate: this.payDate,
        payFrequency: 'W',
        pageType: this.pageType
      }
    });
    return false;
  }
  downloadContractorPayFile() {
    this.spinner.show();
    const request: PayFileRequest = {
      payPeriodId: this.payPeriodId,
      payFrequency: this.payType,
      weekEnding: this.datePipe.transform(this.selected, 'yyyy-MM-dd')
    };
    this.invoiceService.printContractorPayFile(request)
      .subscribe((payFileData: PayFileResponse[]) => {
        this.payFileData = payFileData;
        this.exportToCSV('choice', this.payType === 'Weekly' ? 'W' : 'B');
        this.spinner.hide();
      },
        (error => {
          this.spinner.hide();
          this.alertService.error(error);
        })
      );
  }
  downloadEmployeePayFile() {
    this.spinner.show();
    const request: PayFileRequest = {
      payPeriodId: this.payPeriodId,
      payFrequency: this.payType,
      weekEnding: this.datePipe.transform(this.selected, 'yyyy-MM-dd')
    };
    this.invoiceService.printEmployeePayFile(request)
      .subscribe((payFileData: PayFileResponse[]) => {
        this.payFileData = payFileData;
        this.exportToCSV('choice', this.payType === 'Weekly' ? 'W' : 'B');
        this.spinner.hide();
      },
        (error => {
          this.spinner.hide();
          this.alertService.error(error);
        })
      );
  }
  exportToCSV(fileNamePrefix: string, payType: string) {
    this.exportService.exportToCSV(this.payFileRows(this.payFileData), fileNamePrefix + payType + '0', this.payFileColumns());
  }
  payFileColumns(): any[] {
    return [
      { header: 'PayGroup', key: 'payFrequency' },
      { header: 'Key', key: 'adpFileNumber' },
      { header: 'Name', key: 'name' },
      { header: 'e_expense reimbur_dollars', key: 'expenses' },
      { header: 'e_01a_hours', key: 'hours' },
      { header: 'e_01a_orrate', key: 'payRate' },
      { header: 'e_02_hours', key: 'otHours' },
      { header: 'e_02_orrate', key: 'otRate' },
      { header: 'e_01b_hours', key: 'hours' },
      { header: 'e_01b_orrate', key: 'payRate' }];
  }
  payFileRows(data: PayFileResponse[]): any[] {
    var rows = [];
    let i = 1;
    data.forEach(d => {
      var rowValues = [];
      rowValues[1] = d.payFrequency;
      rowValues[i+1] = d.adpFileNumber;
      rowValues[i+2] = d.name;
      rowValues[i+3] = d.expenses;
      if (d.employeeType === 'Corp to Corp') {
        rowValues[i+8] = d.hours;
        rowValues[i+9] = d.payRate;
      } else {
        rowValues[i+4] = d.hours;
        rowValues[i+5] = d.payRate;
        rowValues[i+6] = d.otHours;
        rowValues[i+7] = d.otRate;
      }
      rows.push(rowValues);
    });
    return rows;
  }
}
