import { TestBed } from '@angular/core/testing';

import { UebungService } from './uebung.service';

describe('UebungService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UebungService = TestBed.get(UebungService);
    expect(service).toBeTruthy();
  });
});
