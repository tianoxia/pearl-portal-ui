import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmployeeHoursComponent } from './view-employee-hours.component';

describe('ViewEmployeeHoursComponent', () => {
  let component: ViewEmployeeHoursComponent;
  let fixture: ComponentFixture<ViewEmployeeHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEmployeeHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEmployeeHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
