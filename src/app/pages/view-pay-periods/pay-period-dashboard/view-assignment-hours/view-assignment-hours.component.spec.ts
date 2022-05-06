import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssignmentHoursComponent } from './view-assignment-hours.component';

describe('ViewAssignmentHoursComponent', () => {
  let component: ViewAssignmentHoursComponent;
  let fixture: ComponentFixture<ViewAssignmentHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAssignmentHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAssignmentHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
