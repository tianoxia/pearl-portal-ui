import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmployeeProfitLossReportComponent } from './view-employee-pl-report.component';

describe('ViewEmployeeProfitLossReportComponent', () => {
  let component: ViewEmployeeProfitLossReportComponent;
  let fixture: ComponentFixture<ViewEmployeeProfitLossReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEmployeeProfitLossReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEmployeeProfitLossReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
