import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessConfirmationPage } from './success-confirmation.page';

describe('SuccessConfirmationPage', () => {
  let component: SuccessConfirmationPage;
  let fixture: ComponentFixture<SuccessConfirmationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessConfirmationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
