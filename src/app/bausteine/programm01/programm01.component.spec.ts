import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { Programm01Component } from './programm01.component';

describe('Programm01Component', () => {
  let component: Programm01Component;
  let fixture: ComponentFixture<Programm01Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Programm01Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Programm01Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
