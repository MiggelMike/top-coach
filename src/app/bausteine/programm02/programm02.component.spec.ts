import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Programm02Component } from './programm02.component';

describe('Programm02Component', () => {
  let component: Programm02Component;
  let fixture: ComponentFixture<Programm02Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Programm02Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Programm02Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
