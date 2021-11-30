import { TestBed } from '@angular/core/testing';

import { ExerciseSettingSvcService } from './exercise-setting-svc.service';

describe('ExerciseSettingSvcService', () => {
  let service: ExerciseSettingSvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseSettingSvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
