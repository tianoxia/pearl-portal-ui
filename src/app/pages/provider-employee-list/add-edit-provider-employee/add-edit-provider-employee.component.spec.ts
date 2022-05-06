import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProviderEmployeeComponent } from './add-edit-provider-employee.component';

describe('AddEditProviderEmployeeComponent', () => {
  let component: AddEditProviderEmployeeComponent;
  let fixture: ComponentFixture<AddEditProviderEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditProviderEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditProviderEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
