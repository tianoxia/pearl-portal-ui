import { Component, OnInit, ViewChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { FileUploadValidators } from '@iplab/ngx-file-upload';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StaticUtilities } from '../../../../_helpers/static-utilities';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import { AlertService, InvoiceReportService } from 'app/_services';
import { InvoiceReportResponse, InvoiceReportRequest, IApiResponse } from 'app/_models';

@Component({
  selector: 'app-print-invoices',
  templateUrl: './print-invoices.component.html',
  styleUrls: ['./print-invoices.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PrintInvoicesComponent implements OnInit {
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
    private route: ActivatedRoute,
    private invoiceService: InvoiceReportService,
    private datePipe: DatePipe,
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
        weekEnding2: '2021-07-30',
        isRequestFromInvoicesReport: false
      };
      this.onExportPdf();
      //this.downloadReport(request);
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

  onExportPdf() {
    const title_height = 30;
    this.invoiceService.getLogoImage().subscribe(res => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.img = reader.result.toString();
        const doc = new jsPDF();
        const formData = new FormData();
        doc.setFontSize(12);
        doc.setFont('Segoe UI', 'bold');
        doc.text('Avery Partners, Inc.', 21, 22);
        doc.text('Invoice', 100, 21);
        doc.text('1805 Old Alabama Road,Suite 200', 21, 27);
        doc.text('Roswell, GA 30076-2230', 21, 32);
        doc.text('Phone: 770.642.6100 | TF: 1.888.966.0214 | Fax: 678.367.4603', 21, 37);
        doc.setFont('Segoe UI', '300');
        doc.setFontSize(8);
        doc.addImage(this.img, 'GIF', 10, 15, 10, 10);
        //autoTable(doc, { html: '#my-table' });
        var head = [['ID', 'Country', 'Rank', 'Capital']];
        var body = [
          [1, 'Denmark', 7.526, 'Copenhagen'],
          [2, 'Switzerland', 7.509, 'Bern'],
          [3, 'Iceland', 7.501, 'Reykjavík'],
        ];
        autoTable(doc, {// styles: { fillColor: [255, 0, 0] },
          //columnStyles: { 0: { halign: 'center', fillColor: [0, 255, 0] } },
          margin: { top: 55 }, head: head, body: body });
        /* const blob = doc.output('blob');
        formData.append('files', blob);
        formData.append('invoiceGroupId', '123456');
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
        }); */
        this.spinner.hide();
        doc.save('table.pdf');
      }
      reader.readAsDataURL(res);
      
    });
  }
  downloadReport(request: InvoiceReportRequest) { 
    let row : any[] = [];
    let rowD : any[] = [];
    let col=['Segment','Title','Total','Description' ]; // initialization for headers 
    let title = "Sample Report"; // title of report 
    /* for(let a=0;a <this.result.length;a++) { 
      row.push(this.result[a].segment);
      row.push(this.result[a].title); 
      row.push(this.result[a].total); 
      row.push(this.result[a].description); 
      rowD.push(row); 
      row =[]; 
    }  */
    this.getReport(col , rowD , title ); 
  } 
  
  getReport(col: any[], rowD: any[], title: any) { 
    const totalPagesExp = "{total_pages_count_string}"; 
    let pdf = new jsPDF('l', 'pt', 'legal'); 
    pdf.setTextColor(51, 156, 255); 
    pdf.text("Sample1", 450, 40); 
    pdf.text("Email:", 450, 60); // 450 here is x-axis and 80 is y-axis 
    pdf.text("Phone:", 450, 80); // 450 here is x-axis and 80 is y-axis 
    pdf.text("" + title, 435,100); // 
    pdf.setLineWidth(1.5); 
    pdf.line(5, 107, 995, 107); 
    var pageContent = function (data) { 
    // HEADER 
    // FOOTER 
      var str = "Page " + data.pageCount; 
      // Total page number plugin only available in jspdf v1.0+ 
      if (typeof pdf.putTotalPages === 'function') { 
        str = str + " of " + totalPagesExp; 
      } 
      pdf.setFontSize(10); 
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight(); 
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number 
    }; 
    autoTable(pdf, { 
      head: col, body: rowD, margin: { top: 110 }
    }); 
    //for adding total number of pages // i.e 10 etc 
    if (typeof pdf.putTotalPages === 'function') { 
      pdf.putTotalPages(totalPagesExp); 
    } 
    pdf.save(title + '.pdf');
  }

  navigateViewInvoice(invoiceGroupId: number) {
    
  }
}
