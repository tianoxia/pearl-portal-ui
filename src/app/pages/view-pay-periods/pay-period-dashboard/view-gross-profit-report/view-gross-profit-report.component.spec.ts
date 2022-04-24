import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGrossProfitReportComponent } from './view-gross-profit-report.component';

describe('ViewGrossProfitReportComponent', () => {
  let component: ViewGrossProfitReportComponent;
  let fixture: ComponentFixture<ViewGrossProfitReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewGrossProfitReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGrossProfitReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
