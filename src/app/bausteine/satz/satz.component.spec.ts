import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatzComponent } from './satz.component';

describe('SatzComponent', () => {
  let component: SatzComponent;
  let fixture: ComponentFixture<SatzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SatzComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SatzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
