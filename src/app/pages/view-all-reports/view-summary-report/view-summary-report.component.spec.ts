import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSummaryReportComponent } from './view-summary-report.component';

describe('ViewSummaryReportComponent', () => {
  let component: ViewSummaryReportComponent;
  let fixture: ComponentFixture<ViewSummaryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSummaryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
