import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsExpensesComponent } from './timesheets-expenses.component';

describe('TimesheetsExpensesComponent', () => {
  let component: TimesheetsExpensesComponent;
  let fixture: ComponentFixture<TimesheetsExpensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetsExpensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetsExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
