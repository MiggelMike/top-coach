import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingsGewichtProgressComponent } from './trainings-gewicht-progress.component';

describe('TrainingsGewichtProgressComponent', () => {
  let component: TrainingsGewichtProgressComponent;
  let fixture: ComponentFixture<TrainingsGewichtProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingsGewichtProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingsGewichtProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
