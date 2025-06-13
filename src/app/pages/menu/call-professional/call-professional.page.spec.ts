import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CallProfessionalPage } from './call-professional.page';

describe('CallProfessionalPage', () => {
  let component: CallProfessionalPage;
  let fixture: ComponentFixture<CallProfessionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CallProfessionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
