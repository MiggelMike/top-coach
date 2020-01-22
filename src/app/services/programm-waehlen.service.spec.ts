import { TestBed } from '@angular/core/testing';

import { ProgrammWaehlenService } from './programm-waehlen.service';

describe('ProgrammWaehlenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProgrammWaehlenService = TestBed.get(ProgrammWaehlenService);
    expect(service).toBeTruthy();
  });
});
