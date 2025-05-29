import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalDashboardPage } from './professional-dashboard.page';

describe('ProfessionalDashboardPage', () => {
  let component: ProfessionalDashboardPage;
  let fixture: ComponentFixture<ProfessionalDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessionalDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
