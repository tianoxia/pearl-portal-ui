import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAssignmentEndDateComponent } from './update-assignment-enddate.component';

describe('UpdateAssignmentEndDateComponent', () => {
  let component: UpdateAssignmentEndDateComponent;
  let fixture: ComponentFixture<UpdateAssignmentEndDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateAssignmentEndDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateAssignmentEndDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
