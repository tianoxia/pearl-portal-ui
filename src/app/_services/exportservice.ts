import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs/dist/exceljs.min.js';

@Injectable({
  providedIn: 'root'
})

export class ExportService {

  constructor() { }

  fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  fileExtension = '.xlsx';

  public exportExcel(jsonData: any[], fileName: string): void {

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: this.fileType });
    FileSaver.saveAs(data, fileName + this.fileExtension);
  }

  public exportExcelWithFormat(data: any[], fileNamePrefix: string, columns: any[]): void {
    // Create workbook and worksheet  
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('My Sheet', { views: [{ showGridLines: true }] });

    worksheet.columns = columns;
    data.forEach(d => {
      worksheet.addRow(d, 'n');
    });

    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
      row.eachCell(function (cell, colNumber) {
        if (rowNumber == 1) {
          cell.font = { bold: true };
        }
        const column = columns[colNumber-1];
        if (column && column.style.alignment) {
          const halign = column.style.alignment.horizontal;
          const valign = column.style.alignment.vertical;
          cell.alignment = {
            vertical: valign? valign : 'middle',
            horizontal: halign? halign : 'left'
          }
        }
      });
    });

    var fileName = fileNamePrefix;
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      FileSaver.saveAs(blob, fileName + '.xlsx');
    });
  }
}
