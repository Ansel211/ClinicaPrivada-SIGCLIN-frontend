import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../../../services/rol.service';
import { ToastService } from '../../../services/toast.service';
import { Rol } from '../../../model/rol';
import { Modulo, ModuloService } from '../../../services/modulo.service';

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
  private moduloService = inject(ModuloService);

  roles = signal<Rol[]>([]);
  modulosDisponibles = signal<Modulo[]>([]);
  modulosSeleccionados: Modulo[] = [];

  modoEdicion = false;
  idRolEnEdicion: number | null = null;

  rolForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarModulos();
  }

  cargarModulos(): void {
    this.moduloService.listarModulos().subscribe({
      next: (data) => this.modulosDisponibles.set(data.filter(m => m.activo)),
      error: (err) => console.error('Error al cargar módulos:', err)
    });
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

  estaModuloSeleccionado(modulo: Modulo): boolean {
    return this.modulosSeleccionados.some(m => m.idMod === modulo.idMod);
  }

  onModuloCheck(modulo: Modulo, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.estaModuloSeleccionado(modulo)) {
        this.modulosSeleccionados.push(modulo);
      }
    } else {
      this.modulosSeleccionados = this.modulosSeleccionados.filter(m => m.idMod !== modulo.idMod);
    }
  }

  seleccionarParaEditar(rol: Rol): void {
    this.modoEdicion = true;
    this.idRolEnEdicion = rol.idRol ?? null;
    this.rolForm.patchValue({
      codigo: rol.codigo,
      descripcion: rol.descripcion
    });
    // Clona los módulos que ya tiene el rol para marcar los checkboxes
    this.modulosSeleccionados = rol.modulos ? [...rol.modulos] : [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.idRolEnEdicion = null;
    this.rolForm.reset();
    this.modulosSeleccionados = [];
  }

  guardarRol(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    const rolPayload: Rol = {
      ...this.rolForm.value,
      activo: true,
      modulos: this.modulosSeleccionados
    };

    if (this.modoEdicion && this.idRolEnEdicion !== null) {
      this.rolService.actualizarRol(this.idRolEnEdicion, rolPayload).subscribe({
        next: () => {
          this.toastService.showSuccess('¡Rol actualizado con éxito!');
          this.cancelarEdicion();
          this.cargarRoles();
        },
        error: (err) => {
          this.toastService.showError('Error al actualizar el rol.');
          console.error('Error al actualizar el rol:', err);
        }
      });
    } else {
      this.rolService.crearRol(rolPayload).subscribe({
        next: () => {
          this.toastService.showSuccess('¡Rol registrado con éxito!');
          this.cancelarEdicion();
          this.cargarRoles();
        },
        error: (err) => {
          this.toastService.showError('Error al guardar el rol.');
          console.error('Error al guardar el rol:', err);
        }
      });
    }
  }

  eliminarRol(rol: Rol): void {
    if (!rol.idRol) return;
    if (!confirm(`¿Está seguro de eliminar el rol ${rol.codigo}?`)) {
      return;
    }

    this.rolService.eliminarRol(rol.idRol).subscribe({
      next: () => {
        this.toastService.showSuccess('Rol eliminado correctamente.');
        if (this.idRolEnEdicion === rol.idRol) {
          this.cancelarEdicion();
        }
        this.cargarRoles();
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'No se pudo eliminar el rol.';
        this.toastService.showError(msg);
      }
    });
  }
}