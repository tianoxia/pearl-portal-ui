import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPayrollReportComponent } from './view-payroll-report.component';

describe('ViewPayrollReportComponent', () => {
  let component: ViewPayrollReportComponent;
  let fixture: ComponentFixture<ViewPayrollReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPayrollReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPayrollReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
