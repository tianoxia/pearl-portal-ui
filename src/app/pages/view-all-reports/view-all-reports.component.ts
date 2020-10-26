import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-all-reports',
  templateUrl: './view-all-reports.component.html',
  styleUrls: ['./view-all-reports.component.css']
})
export class ViewAllReportsComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.hide();
  }

}
