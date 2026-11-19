import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarModuloComponent} from './registrar-modulo';

describe('RegistrarModulo', () => {
  let component: RegistrarModuloComponent;
  let fixture: ComponentFixture<RegistrarModuloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarModuloComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarModuloComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
