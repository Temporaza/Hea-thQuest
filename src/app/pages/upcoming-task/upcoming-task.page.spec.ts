import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingTaskPage } from './upcoming-task.page';

describe('UpcomingTaskPage', () => {
  let component: UpcomingTaskPage;
  let fixture: ComponentFixture<UpcomingTaskPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UpcomingTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
