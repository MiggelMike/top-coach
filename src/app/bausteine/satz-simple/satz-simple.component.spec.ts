import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatzSimpleComponent } from './satz-simple.component';

describe('SatzSimpleComponent', () => {
  let component: SatzSimpleComponent;
  let fixture: ComponentFixture<SatzSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SatzSimpleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SatzSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
