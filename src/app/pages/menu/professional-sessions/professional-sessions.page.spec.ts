import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalSessionsPage } from './professional-sessions.page';

describe('ProfessionalSessionsPage', () => {
  let component: ProfessionalSessionsPage;
  let fixture: ComponentFixture<ProfessionalSessionsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessionalSessionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
