import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCommissionDetailReportComponent } from './view-commission-detail-report.component';

describe('ViewCommissionReportComponent', () => {
  let component: ViewCommissionDetailReportComponent;
  let fixture: ComponentFixture<ViewCommissionDetailReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCommissionDetailReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCommissionDetailReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
