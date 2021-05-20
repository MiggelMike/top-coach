import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionStatsOverlayComponent } from './session-stats-overlay.component';

describe('SessionStatsOverlayComponent', () => {
  let component: SessionStatsOverlayComponent;
  let fixture: ComponentFixture<SessionStatsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionStatsOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionStatsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
