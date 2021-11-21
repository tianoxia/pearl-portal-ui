import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../_services/alert.service';

@Component({
  selector: 'app-report-subtitle',
  templateUrl: './report-subtitle.component.html',
  styleUrls: ['./report-subtitle.component.scss']
})

export class ReportSubtitleComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  message: any;
  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.subscription = this.alertService.getMessage().subscribe(message => {
      this.message = message;
    });
  }

  close() {
    this.message = null;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
