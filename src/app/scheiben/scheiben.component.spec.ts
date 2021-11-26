import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheibenComponent } from './scheiben.component';

describe('ScheibenComponent', () => {
  let component: ScheibenComponent;
  let fixture: ComponentFixture<ScheibenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheibenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheibenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
