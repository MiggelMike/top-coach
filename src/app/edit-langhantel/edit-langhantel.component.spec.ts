import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLanghantelComponent } from './edit-langhantel.component';

describe('EditLanghantelComponent', () => {
  let component: EditLanghantelComponent;
  let fixture: ComponentFixture<EditLanghantelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditLanghantelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLanghantelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
