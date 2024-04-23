import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetNamePage } from './pet-name.page';

describe('PetNamePage', () => {
  let component: PetNamePage;
  let fixture: ComponentFixture<PetNamePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PetNamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
