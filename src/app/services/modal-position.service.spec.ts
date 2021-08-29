import { TestBed } from '@angular/core/testing';

import { ModalPositionService } from './modal-position.service';

describe('ModalPositionService', () => {
  let service: ModalPositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalPositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
