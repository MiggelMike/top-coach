import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnstehendeSessionsComponent } from './anstehende-sessions.component';

describe('AnstehendeSessionsComponent', () => {
  let component: AnstehendeSessionsComponent;
  let fixture: ComponentFixture<AnstehendeSessionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnstehendeSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnstehendeSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
