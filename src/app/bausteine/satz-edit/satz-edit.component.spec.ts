import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatzEditComponent } from './satz-edit.component';

describe('SatzEditComponent', () => {
  let component: SatzEditComponent;
  let fixture: ComponentFixture<SatzEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SatzEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SatzEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
