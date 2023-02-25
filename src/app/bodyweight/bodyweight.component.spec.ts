import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyweightComponent } from './bodyweight.component';

describe('BodyweightComponent', () => {
  let component: BodyweightComponent;
  let fixture: ComponentFixture<BodyweightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyweightComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyweightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
