import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseExpensesComponent } from './release-expenses.component';

describe('ReleaseExpensesComponent', () => {
  let component: ReleaseExpensesComponent;
  let fixture: ComponentFixture<ReleaseExpensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseExpensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
