import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInvoicesComponent } from './print-invoices.component';

describe('PrintInvoicesComponent', () => {
  let component: PrintInvoicesComponent;
  let fixture: ComponentFixture<PrintInvoicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintInvoicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
