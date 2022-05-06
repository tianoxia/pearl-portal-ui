import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditInvoiceGroupComponent } from './add-edit-invoice-group.component';

describe('AddEditInvoiceGroupComponent', () => {
  let component: AddEditInvoiceGroupComponent;
  let fixture: ComponentFixture<AddEditInvoiceGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditInvoiceGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditInvoiceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
