import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrucksOnMapComponent } from './trucks-on-map.component';

describe('TrucksOnMapComponent', () => {
  let component: TrucksOnMapComponent;
  let fixture: ComponentFixture<TrucksOnMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrucksOnMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrucksOnMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
