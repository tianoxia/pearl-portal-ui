import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewControlReportComponent } from './view-control-report.component';

describe('ViewControlReportComponent', () => {
  let component: ViewControlReportComponent;
  let fixture: ComponentFixture<ViewControlReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewControlReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewControlReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
