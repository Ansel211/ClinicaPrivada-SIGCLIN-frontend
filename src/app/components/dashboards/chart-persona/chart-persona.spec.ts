import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartPersona } from './chart-persona';

describe('ChartPersona', () => {
  let component: ChartPersona;
  let fixture: ComponentFixture<ChartPersona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartPersona],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartPersona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
