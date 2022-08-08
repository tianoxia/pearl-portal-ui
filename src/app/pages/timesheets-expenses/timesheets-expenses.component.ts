import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-timesheets-expenses',
  templateUrl: './timesheets-expenses.component.html',
  styleUrls: ['./timesheets-expenses.component.css']
})
export class TimesheetsExpensesComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.hide();
  }
}
