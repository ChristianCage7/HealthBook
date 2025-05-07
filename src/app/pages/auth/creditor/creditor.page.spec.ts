import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditorPage } from './creditor.page';

describe('CreditorPage', () => {
  let component: CreditorPage;
  let fixture: ComponentFixture<CreditorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
