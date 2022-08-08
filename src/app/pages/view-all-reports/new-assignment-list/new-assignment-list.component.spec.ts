import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAssignmentListComponent } from './new-assignment-list.component';

describe('NewAssignmentListComponent', () => {
  let component: NewAssignmentListComponent;
  let fixture: ComponentFixture<NewAssignmentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAssignmentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAssignmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
