import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAssignmentComponent } from './add-edit-client-assignment.component';

describe('AddEditAssignmentComponent', () => {
  let component: AddEditAssignmentComponent;
  let fixture: ComponentFixture<AddEditAssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditAssignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
