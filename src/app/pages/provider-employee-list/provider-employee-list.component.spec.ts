import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderEmployeeListComponent } from './provider-employee-list.component';

describe('ProviderEmployeeListComponent', () => {
  let component: ProviderEmployeeListComponent;
  let fixture: ComponentFixture<ProviderEmployeeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderEmployeeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderEmployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
