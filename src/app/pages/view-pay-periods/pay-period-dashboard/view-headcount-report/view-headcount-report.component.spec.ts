import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHeadCountReportComponent } from './view-headcount-report.component';

describe('ViewHeadCountReportComponent', () => {
  let component: ViewHeadCountReportComponent;
  let fixture: ComponentFixture<ViewHeadCountReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewHeadCountReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHeadCountReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
