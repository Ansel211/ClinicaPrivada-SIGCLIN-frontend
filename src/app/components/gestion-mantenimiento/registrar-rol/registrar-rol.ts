import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../../../services/rol.service';
import { ToastService } from '../../../services/toast.service';
import { Rol } from '../../../model/rol';

@Component({
  selector: 'app-registrar-rol',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-rol.html',
  styleUrl: './registrar-rol.css'
})
export class RegistrarRolComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolService = inject(RolService);
  private toastService = inject(ToastService);
  roles = signal<Rol[]>([]);
  
  rolForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.rolService.getRoles().subscribe({
      next: (data) => this.roles.set(data),
      error: (err) => {
        this.toastService.showError('Error al cargar roles.');
        console.error('Error al cargar roles:', err);
      }
    });
  }

  guardarRol(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    const nuevoRol: Rol = {
      ...this.rolForm.value,
      activo: true
    };

    this.rolService.crearRol(nuevoRol).subscribe({
      next: () => {
        this.toastService.showSuccess('¡Rol registrado con éxito!');
        this.rolForm.reset();
        this.cargarRoles();
      },
      error: (err) => {
        this.toastService.showError('Error al guardar el rol.');
        console.error('Error al guardar el rol:', err);
      }
    });
  }
}