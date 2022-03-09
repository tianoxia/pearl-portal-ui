import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReferalReportComponent } from './view-referal-report.component';

describe('ViewReferalReportComponent', () => {
  let component: ViewReferalReportComponent;
  let fixture: ComponentFixture<ViewReferalReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewReferalReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReferalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
