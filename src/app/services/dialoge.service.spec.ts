import { TestBed } from '@angular/core/testing';

import { DialogeService } from './dialoge.service';

describe('DialogeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DialogeService = TestBed.get(DialogeService);
    expect(service).toBeTruthy();
  });
});
