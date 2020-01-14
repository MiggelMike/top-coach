import { TestBed } from '@angular/core/testing';

import { TrainingsProgrammSvcService } from './trainings-programm-svc.service';

describe('TrainingsProgrammSvcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TrainingsProgrammSvcService = TestBed.get(TrainingsProgrammSvcService);
    expect(service).toBeTruthy();
  });
});
