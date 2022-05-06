import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCommissionReportComponent } from './view-commission-report.component';

describe('ViewCommissionReportComponent', () => {
  let component: ViewCommissionReportComponent;
  let fixture: ComponentFixture<ViewCommissionReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCommissionReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCommissionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
