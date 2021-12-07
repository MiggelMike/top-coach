import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrainingsGewichtProgressComponent } from './edit-trainings-gewicht-progress.component';

describe('EditTrainingsGewichtProgressComponent', () => {
  let component: EditTrainingsGewichtProgressComponent;
  let fixture: ComponentFixture<EditTrainingsGewichtProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTrainingsGewichtProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTrainingsGewichtProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
