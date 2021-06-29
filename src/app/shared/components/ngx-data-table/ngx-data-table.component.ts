import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { NgxDataTableDataSource } from './ngx-data-table-datasource';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'ngx-data-table',
  templateUrl: './ngx-data-table.component.html',
  styles: [
    `.detail-table {display: flex;flex-direction: column;display: block;margin: 10px;width: 100%;max-width:1200px;overflow:auto;}
    .expand-icon {color: rgba(0,0,0,.44);font-size: 12px; margin-right: 5px; cursor: pointer;}
    .col-value:first-child span{margin-left: 15px;}    
    .mat-form-field {padding: 10px 10px 0 10px;width: calc(100% - 20px);}
    .mat-form-field:first-child{width: 40%;}
    .mat-header-cell{font-weight:500; color:#000000; background-color:#d9dbdd;}
    .mat-cell:nth-child(6){min-width: 60px;}
    .mat-header-cell:nth-child(6){min-width: 60px;}
    .mat-cell:not(:nth-child(6)){min-width: 45px;}
    .mat-header-cell:not(:nth-child(6)){min-width: 45px;}
    .mat-cell:first-child{min-width: 100px;margin-left:3px;padding-left:3px}
    .mat-header-cell:first-child{min-width: 100px;margin-left:0px;padding-left:6px}
    .mat-cell:nth-child(4){min-width: 20px;}
    .mat-header-cell:nth-child(4){min-width: 20px;}
    .mat-cell:nth-child(3){min-width: 30px;}
    .mat-header-cell:nth-child(3){min-width: 30px;}
    .mat-cell:nth-child(7),.mat-cell:nth-child(14),.mat-cell:nth-child(15){min-width: 50px;}
    .mat-header-cell:nth-child(7),.mat-header-cell:nth-child(14),.mat-header-cell:nth-child(15){min-width: 50px;}
    .mat-row:nth-child(2n+1) {background-color: #f5f5f5;}
    .mat-row:not(:nth-child(2n+1)) {background-color: #fff;}`
  ],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ]
})
export class NgxDataTableComponent {
  @Input()
  set data(_data: any[]) {
    if (_data) {
      this.dataSource = new NgxDataTableDataSource(
        this.paginator,
        _data,
        this.sort
      );
      this.displayedColumns = Object.keys(_data[0]).filter(
        key => key !== 'details'
      );
    }
  }
  @ViewChild(MatPaginator, { static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: NgxDataTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: Array<string>;
  expandedElement: Array<string>;
  isExpansionDetailRow = (i: number, row: Object) =>
    row.hasOwnProperty('detailRow');

  /**
   * expand collapse a row
   * @param row
   */
  toggleRow(row) {
    if (this.expandedElement === row) {
      this.expandedElement = null;
    } else {
      this.expandedElement = row;
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
  }
}
