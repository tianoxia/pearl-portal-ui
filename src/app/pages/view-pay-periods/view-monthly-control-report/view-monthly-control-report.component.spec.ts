import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMonthlyControlReportComponent } from './view-monthly-control-report.component';

describe('ViewMonthlyControlReportComponent', () => {
  let component: ViewMonthlyControlReportComponent;
  let fixture: ComponentFixture<ViewMonthlyControlReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMonthlyControlReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMonthlyControlReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
