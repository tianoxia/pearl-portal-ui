import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-pay-periods',
  templateUrl: './view-pay-periods.component.html',
  styleUrls: ['./view-pay-periods.component.css']
})
export class ViewPayPeriodsComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.spinner.hide();
  }

}
