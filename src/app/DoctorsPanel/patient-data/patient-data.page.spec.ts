import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientDataPage } from './patient-data.page';

describe('PatientDataPage', () => {
  let component: PatientDataPage;
  let fixture: ComponentFixture<PatientDataPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PatientDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
