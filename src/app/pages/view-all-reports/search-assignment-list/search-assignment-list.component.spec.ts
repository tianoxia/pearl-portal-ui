import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAssignmentListComponent } from './search-assignment-list.component';

describe('SearchAssignmentListComponent', () => {
  let component: SearchAssignmentListComponent;
  let fixture: ComponentFixture<SearchAssignmentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchAssignmentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchAssignmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
