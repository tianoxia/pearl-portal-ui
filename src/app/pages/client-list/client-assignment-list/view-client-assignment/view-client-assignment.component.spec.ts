import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssignmentComponent } from './view-client-assignment.component';

describe('ViewAssignmentComponent', () => {
  let component: ViewAssignmentComponent;
  let fixture: ComponentFixture<ViewAssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAssignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
