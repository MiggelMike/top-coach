import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateCalcComponent } from './plate-calc.component';

describe('PlateCalcComponent', () => {
  let component: PlateCalcComponent;
  let fixture: ComponentFixture<PlateCalcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlateCalcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateCalcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
