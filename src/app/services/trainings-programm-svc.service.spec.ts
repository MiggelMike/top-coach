import { TestBed } from '@angular/core/testing';

import { TrainingsProgrammSvc } from './trainings-programm-svc.service';

describe('TrainingsProgrammSvcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TrainingsProgrammSvc = TestBed.get(TrainingsProgrammSvc);
    expect(service).toBeTruthy();
  });
});
