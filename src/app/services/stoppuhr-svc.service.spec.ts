import { TestBed } from '@angular/core/testing';

import { StoppuhrSvcService } from './stoppuhr-svc.service';

describe('StoppuhrSvcService', () => {
  let service: StoppuhrSvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoppuhrSvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
