import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPayPeriodsComponent } from './view-pay-periods.component';

describe('ViewPayPeriodsComponent', () => {
  let component: ViewPayPeriodsComponent;
  let fixture: ComponentFixture<ViewPayPeriodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPayPeriodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPayPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
