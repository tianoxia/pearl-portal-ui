import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayPeriodDashboardComponent } from './pay-period-dashboard.component';

describe('PayPeriodDashboardComponent', () => {
  let component: PayPeriodDashboardComponent;
  let fixture: ComponentFixture<PayPeriodDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayPeriodDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayPeriodDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
