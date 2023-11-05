import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorLoginPage } from './doctor-login.page';

describe('DoctorLoginPage', () => {
  let component: DoctorLoginPage;
  let fixture: ComponentFixture<DoctorLoginPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DoctorLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
