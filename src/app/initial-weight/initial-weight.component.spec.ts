import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialWeightComponent } from './initial-weight.component';

describe('InitialWeightComponent', () => {
  let component: InitialWeightComponent;
  let fixture: ComponentFixture<InitialWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitialWeightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
