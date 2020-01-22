import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammWaehlenComponent } from './programm-waehlen.component';

describe('ProgrammWaehlenComponent', () => {
  let component: ProgrammWaehlenComponent;
  let fixture: ComponentFixture<ProgrammWaehlenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgrammWaehlenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgrammWaehlenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
