import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMuscleGroupComponent } from './edit-muscle-group.component';

describe('EditMuscleGroupComponent', () => {
  let component: EditMuscleGroupComponent;
  let fixture: ComponentFixture<EditMuscleGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMuscleGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMuscleGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
