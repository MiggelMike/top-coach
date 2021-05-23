import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStoreButtonsComponent } from './data-store-buttons.component';

describe('DataStoreButtonsComponent', () => {
  let component: DataStoreButtonsComponent;
  let fixture: ComponentFixture<DataStoreButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataStoreButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataStoreButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
