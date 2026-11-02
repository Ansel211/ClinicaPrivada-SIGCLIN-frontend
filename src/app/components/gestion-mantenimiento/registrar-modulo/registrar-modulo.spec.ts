import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarModulo } from './registrar-modulo';

describe('RegistrarModulo', () => {
  let component: RegistrarModulo;
  let fixture: ComponentFixture<RegistrarModulo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarModulo],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarModulo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
