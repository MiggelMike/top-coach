import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanghantelComponent } from './langhantel.component';

describe('LanghantelComponent', () => {
  let component: LanghantelComponent;
  let fixture: ComponentFixture<LanghantelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LanghantelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanghantelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
