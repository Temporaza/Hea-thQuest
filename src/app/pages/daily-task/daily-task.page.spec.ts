import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyTaskPage } from './daily-task.page';

describe('DailyTaskPage', () => {
  let component: DailyTaskPage;
  let fixture: ComponentFixture<DailyTaskPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DailyTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
