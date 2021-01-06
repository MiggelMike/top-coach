import { TestBed } from '@angular/core/testing';

import { DexieSvcService } from './dexie-svc.service';

describe('DexieSvcService', () => {
  let service: DexieSvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DexieSvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
