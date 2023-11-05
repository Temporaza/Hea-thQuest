import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinishedTaskPage } from './finished-task.page';

describe('FinishedTaskPage', () => {
  let component: FinishedTaskPage;
  let fixture: ComponentFixture<FinishedTaskPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FinishedTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
