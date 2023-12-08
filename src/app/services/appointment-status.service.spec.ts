import { TestBed } from '@angular/core/testing';

import { AppointmentStatusService } from './appointment-status.service';

describe('AppointmentStatusService', () => {
  let service: AppointmentStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
