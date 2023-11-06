import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingDocPage } from './pending-doc.page';

describe('PendingDocPage', () => {
  let component: PendingDocPage;
  let fixture: ComponentFixture<PendingDocPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PendingDocPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
