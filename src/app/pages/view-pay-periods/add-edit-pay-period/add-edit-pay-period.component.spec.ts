import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPayPeriodComponent } from './add-edit-pay-period.component';

describe('AddPayPeriodComponent', () => {
  let component: AddEditPayPeriodComponent;
  let fixture: ComponentFixture<AddEditPayPeriodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditPayPeriodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditPayPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
