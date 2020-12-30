import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UebungWaehlenComponent } from './uebung-waehlen.component';

describe('UebungWaehlenComponent', () => {
  let component: UebungWaehlenComponent;
  let fixture: ComponentFixture<UebungWaehlenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UebungWaehlenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UebungWaehlenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
