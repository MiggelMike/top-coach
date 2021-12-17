import { TestBed } from '@angular/core/testing';

import { PlateCalcSvcService } from './plate-calc-svc.service';

describe('PlateCalcSvcService', () => {
  let service: PlateCalcSvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlateCalcSvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
