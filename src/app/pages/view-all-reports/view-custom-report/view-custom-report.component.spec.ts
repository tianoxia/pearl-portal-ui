import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomReportComponent } from './view-custom-report.component';

describe('ViewCustomReportComponent', () => {
  let component: ViewCustomReportComponent;
  let fixture: ComponentFixture<ViewCustomReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCustomReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCustomReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
