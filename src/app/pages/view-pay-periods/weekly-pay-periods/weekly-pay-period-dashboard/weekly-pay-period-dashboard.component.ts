import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RowInput, CellInput } from 'jspdf-autotable';
import { DatePipe, CurrencyPipe } from '@angular/common';

import { InvoiceReportService, AlertService } from 'app/_services';
import { InvoicePdfResponse, InvoicePdfData, InvoiceReportRequest } from 'app/_models';

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
  payPeriodId: number;
  selected: Date;
  constructor(public alertService: AlertService,
    private spinner: NgxSpinnerService,
    private invoiceService: InvoiceReportService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private route: ActivatedRoute) { }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.queryParamMap.subscribe(params => {
      this.payType = params.get('paytype');
      this.payPeriodId = +params.get('payperiodid');
      this.payDate = new Date(params.get('paydate'));
      this.weekEndings.push(new Date(params.get('weekending')));
      this.selected = this.weekEndings[0];
    });    
  }
  downloadReport() {
    this.invoiceService.getLogoImage().subscribe(res => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const request: InvoiceReportRequest = {
          payPeriodId: this.payPeriodId,
          payDate: this.datePipe.transform(this.payDate, 'yyyy-MM-dd'),
          payFrequency: this.payType,
          weekEnding1: this.datePipe.transform(this.selected, 'yyyy-MM-dd'),
          weekEnding2: '2021-07-30'
        };
        this.invoiceService.printInvoiceReport(request)
          .subscribe((reports: InvoicePdfResponse[]) => {
            this.generatePdfReport(reports, reader);
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
  
  headRows(): RowInput[] {
    return [
      { name: 'Name', expense: 'Expense', hours: 'Reg\nHours', billRate: 'Bill\nRate',
      regularAmount: 'Reg\nAmount', otHours: 'OT\nHours', otBillRate: 'OT\nRate', otAmount: 'OT\nAmount',
      dtHours: 'DT\nHours', dtBillRate: 'DT\nRate', dtAmount: 'DT\nAmount', discount: 'Discount', total: 'Total' }
    ]
  }
  groupHeaderRows(): RowInput[] {
    return [];
  }

  groupHeaderBodyRows(report: InvoicePdfResponse) {
    return [];
  }
  generatePdfReport(reports: InvoicePdfResponse[], reader: FileReader): void {
    const doc = new jsPDF();//('p','px','a4');
    const totalPagesExp = '{total_pages_count_string}';
    const freq = this.payType;
    const wk = this.datePipe.transform(this.selected, 'MM/dd/yyyy');
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
        tableWidth: 100,
        body: [
          {
            content: 'Bill To : ' + report.clientName
          }
        ],
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
        body: [
          { content: 'Invoice #: ' + report.invoiceNumber },
          { content: 'Date: ' + this.datePipe.transform(new Date(), 'MM/dd/yyyy') },
          { content: 'P.O. No.: ' + (report.purchaseOrderNo == 0 ? '' : report.purchaseOrderNo) },
          { content: 'Term: ' + report.term } 
        ],
        alternateRowStyles: { fillColor: '#ffffff'},
        bodyStyles: { fontStyle: 'bold', fontSize: 12, lineColor: '#000000' },
        margin: { left: 100 }
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
          fillColor: [22, 160, 133]
        },
        showFoot: 'lastPage',
        foot: [
          { name: '', expense: (report.invoiceDetails.map(a => a.expenses).reduce(function(a, b)
          {
            return a + b;
          })).toFixed(2), hours: '', billRate: '',
          amount: '', otHours: '', otRate: '', otAmount: '',
          dtHours: '', dtRate: '', dtAmount: '', discount: 'Total : ', total: this.currencyPipe.transform((report.invoiceDetails.map(a => a.invoiceTotal).reduce(function(a, b)
          {
            return a + b;
          })).toFixed(2), 'USD') }
        ],
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
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp); 
    }
    doc.deletePage(doc.getNumberOfPages());
    doc.save('table.pdf');
    this.spinner.hide();
  }

  buildPageHeader(doc: jsPDF, reader: FileReader): void {
    const image = reader.result.toString();
    const formData = new FormData();
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
  }

  buildDisclaimer(doc: jsPDF): string {
    doc.setFontSize(10);
    doc.setFont('Arial', 'italic', 'bold');
    return "Please notice the change in the payment address. Send all payments to:\n\nAvery Partners, Inc\n1805 Old Alabama Rd, Suite 200\nRoswell, GA 30076";
  }
}
