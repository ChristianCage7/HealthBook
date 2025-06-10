import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAvailabilityPage } from './manage-availability.page';

describe('ManageAvailabilityPage', () => {
  let component: ManageAvailabilityPage;
  let fixture: ComponentFixture<ManageAvailabilityPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAvailabilityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
