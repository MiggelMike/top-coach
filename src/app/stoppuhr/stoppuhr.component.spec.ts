import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoppuhrComponent } from './stoppuhr.component';

describe('StoppuhrComponent', () => {
  let component: StoppuhrComponent;
  let fixture: ComponentFixture<StoppuhrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoppuhrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoppuhrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
