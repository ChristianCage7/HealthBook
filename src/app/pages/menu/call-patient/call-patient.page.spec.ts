import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CallPatientPage } from './call-patient.page';

describe('CallPatientPage', () => {
  let component: CallPatientPage;
  let fixture: ComponentFixture<CallPatientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CallPatientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
