import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditorProfileEditPage } from './creditor-profile-edit.page';

describe('CreditorProfileEditPage', () => {
  let component: CreditorProfileEditPage;
  let fixture: ComponentFixture<CreditorProfileEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditorProfileEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
