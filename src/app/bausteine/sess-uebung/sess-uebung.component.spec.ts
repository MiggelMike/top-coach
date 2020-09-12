import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessUebungComponent } from './sess-uebung.component';

describe('SessUebungComponent', () => {
  let component: SessUebungComponent;
  let fixture: ComponentFixture<SessUebungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessUebungComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessUebungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
