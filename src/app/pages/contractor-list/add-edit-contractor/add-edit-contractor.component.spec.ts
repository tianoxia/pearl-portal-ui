import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditContractorComponent } from './add-edit-contractor.component';

describe('AddEditContractorComponent', () => {
  let component: AddEditContractorComponent;
  let fixture: ComponentFixture<AddEditContractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditContractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
