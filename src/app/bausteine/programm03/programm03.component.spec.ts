import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { Programm03Component } from './programm03.component';

describe('Programm03Component', () => {
  let component: Programm03Component;
  let fixture: ComponentFixture<Programm03Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Programm03Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Programm03Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
