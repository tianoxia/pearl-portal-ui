import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceGroupListComponent } from './invoice-group-list.component';

describe('InvoiceGroupListComponent', () => {
  let component: InvoiceGroupListComponent;
  let fixture: ComponentFixture<InvoiceGroupListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceGroupListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
