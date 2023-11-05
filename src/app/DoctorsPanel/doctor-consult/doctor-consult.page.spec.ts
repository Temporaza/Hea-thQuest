import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorConsultPage } from './doctor-consult.page';

describe('DoctorConsultPage', () => {
  let component: DoctorConsultPage;
  let fixture: ComponentFixture<DoctorConsultPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DoctorConsultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
