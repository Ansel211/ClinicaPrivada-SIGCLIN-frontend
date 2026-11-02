import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarRol } from './registrar-rol';

describe('RegistrarRol', () => {
  let component: RegistrarRol;
  let fixture: ComponentFixture<RegistrarRol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarRol],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarRol);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
