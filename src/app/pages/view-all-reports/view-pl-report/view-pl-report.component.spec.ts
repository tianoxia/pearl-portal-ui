import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPlReportComponent } from './view-pl-report.component';

describe('ViewPlReportComponent', () => {
  let component: ViewPlReportComponent;
  let fixture: ComponentFixture<ViewPlReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPlReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPlReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
