import { TestBed } from '@angular/core/testing';

import { SessionOverlayServiceService } from './session-overlay-service.service';

describe('SessionOverlayServiceService', () => {
  let service: SessionOverlayServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionOverlayServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
