import { Component, OnInit, ViewChild, Input, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router  } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource, MatDialog, MatSelectChange } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService, TimesheetsExpensesService } from 'app/_services';
import { ExpenseRecordsResponse, Contractor } from 'app/_models';

@Component({
  selector: 'app-release-expenses',
  templateUrl: './release-expenses.component.html',
  styleUrls: ['./release-expenses.component.scss']
})
export class ReleaseExpensesComponent implements OnInit {
  @Input()expensesForm: FormGroup;
  @Input()expenseDraftsForm: FormGroup;
  @Input()selectedIndex: number | 0;
  @ViewChild('table1', {read: MatSort, static: false }) set content1(sort: MatSort) {
    this.allExpenseDrafts.sort = sort;
  }
  @ViewChild('table2', {read: MatSort, static: false }) set content2(sort: MatSort) {
    this.allExpenses.sort = sort;
  }
  @ViewChild('TableOnePaginator', {static: true}) tableOnePaginator: MatPaginator;
  @ViewChild('TableTwoPaginator', {static: true}) tableTwoPaginator: MatPaginator;
  @ViewChild('expenseDetailDialog', { static: true, read: TemplateRef }) expenseDetailRef: TemplateRef<any>;
  public displayedColumns = ['clientName', 'contractorName', 'weeklyExpense', 'submitDate', 'expenseStatus', 'approverName',
'release', 'comment'];

  public displayedDraftColumns = ['clientName', 'contractorName', 'weeklyExpense', 'created', 'modified'];
  public allExpenses = new MatTableDataSource<ExpenseRecordsResponse>();
  public allExpenseDrafts = new MatTableDataSource<ExpenseRecordsResponse>();
  weekEndings: string[];
  selectedContractor: Contractor;
  
  constructor(
    public alertService: AlertService,
    fb: FormBuilder,
    private dataService: TimesheetsExpensesService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService) {
      this.expensesForm = fb.group({        
        expenseWeekEnding: ['', [Validators.required]]
      });
      this.expenseDraftsForm = fb.group({
        draftWeekEnding: ['', [Validators.required]]
      });
      this.selectedContractor = new Contractor();
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.spinner.show();
      if (params.get('type') === 'expense') {
        this.selectedIndex = 1;
      } else {
        this.selectedIndex = 0;
      }
      this.executeGetAllExpensesByWeekending();
  });
}

  executeGetAllExpensesByWeekending() {
    return this.dataService.getSubmittedExpenseWeekEnding().subscribe((wke: string[]) => {
      if (wke !== null && wke.length > 0) {
        forkJoin([this.dataService.getAllExpensesByWeekending(wke[0]),
          this.dataService.getAllExpenseDraftsByWeekending(wke[0])])
        .subscribe(([tsInfo, dfInfo]) => {
          this.allExpenses.data = tsInfo as ExpenseRecordsResponse[];
          this.allExpenseDrafts.data = dfInfo as ExpenseRecordsResponse[];
          this.weekEndings = wke;
          this.expensesForm.controls.expenseWeekEnding.patchValue(wke[0]);
          this.expenseDraftsForm.controls.draftWeekEnding.patchValue(wke[0]);
          this.allExpenseDrafts.paginator = this.tableOnePaginator;
          this.allExpenses.paginator = this.tableTwoPaginator;
          window.scrollTo(0, 0);
          this.spinner.hide();
        },
        error => {
          this.alertService.error(error);
          window.scrollTo(0, 0);
          this.spinner.hide();
        });
      }
    }, error => {
      this.alertService.error(error);
      window.scrollTo(0, 0);
      this.spinner.hide();
    });
  }

  changeWeekEnding(event: MatSelectChange, type: string) {
    switch (type) {
      case 'expense':
        this.loadExpenses(this.datePipe.transform(event.value, 'yyyy-MM-dd'));
        break;
      case 'draft':
        this.loadDrafts(this.datePipe.transform(event.value, 'yyyy-MM-dd'));
        break;
    }
  }

  loadDrafts(weekEnding: string) {
    this.dataService.getAllExpenseDraftsByWeekending(weekEnding).subscribe(dfInfo => {
      this.allExpenseDrafts.data = dfInfo as ExpenseRecordsResponse[];
      this.allExpenseDrafts.paginator = this.tableOnePaginator;
      window.scrollTo(0, 0);
      this.spinner.hide();
    },
    error => {
      this.alertService.error(error);
      window.scrollTo(0, 0);
      this.spinner.hide();
    });
  }
  loadExpenses(weekEnding: string) {
    this.dataService.getAllExpensesByWeekending(weekEnding).subscribe(tsInfo => {
      this.allExpenses.data = tsInfo as ExpenseRecordsResponse[];
      this.allExpenses.paginator = this.tableTwoPaginator;
      window.scrollTo(0, 0);
      this.spinner.hide();
    },
    error => {
      this.alertService.error(error);
      window.scrollTo(0, 0);
      this.spinner.hide();
    });
  }
  onExpenseTabChange(event: MatTabChangeEvent) {
    const tab = event.tab.textLabel;
    this.spinner.show();
    if (tab === 'Expense Drafts') {
      return this.dataService.getSubmittedExpenseWeekEnding().subscribe((wke: string[]) => {
        if (wke !== null && wke.length > 0) {
            this.loadDrafts(wke[0]);
            this.weekEndings = wke;
            this.expenseDraftsForm.controls.draftWeekEnding.patchValue(wke[0]);
        }
      }, error => {
        this.alertService.error(error);
        window.scrollTo(0, 0);
        this.spinner.hide();
      });
    } else if (tab === 'Submitted Expenses') {
      return this.dataService.getSubmittedExpenseWeekEnding().subscribe((wke: string[]) => {
        if (wke !== null && wke.length > 0) {
          this.loadExpenses(wke[0]);
          this.weekEndings = wke;
          this.expensesForm.controls.expenseWeekEnding.patchValue(wke[0]);
        }
      }, error => {
        this.alertService.error(error);
        window.scrollTo(0, 0);
        this.spinner.hide();
      });
    }
  }

  applyFilterOne(filterValue: string) {
    this.allExpenseDrafts.filter = filterValue.trim().toLowerCase();
  }

  openExpenseDetailDialog(expenseDetailDialog) {
    this.dialog.open(expenseDetailDialog, {
      autoFocus: false,
      width: '400px',
      disableClose: true
    });
  }
}
