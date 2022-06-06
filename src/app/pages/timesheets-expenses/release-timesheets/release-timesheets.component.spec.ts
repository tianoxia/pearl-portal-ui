import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseTimesheetsComponent } from './release-timesheets.component';

describe('ReleaseTimesheetsComponent', () => {
  let component: ReleaseTimesheetsComponent;
  let fixture: ComponentFixture<ReleaseTimesheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseTimesheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseTimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
