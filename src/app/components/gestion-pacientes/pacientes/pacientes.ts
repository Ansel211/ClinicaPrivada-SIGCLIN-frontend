import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PacienteService } from '../../../services/paciente.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class PacientesComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private toastService = inject(ToastService);

  listaPacientes = signal<any[]>([]);

  // Filtros individuales por columna (estilo rúbrica de la profesora)
  filtro = signal({
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
    numDocumento: '',
    telefono: ''
  });

  // Lista filtrada reactivamente
  listaPacientesFiltrados = computed(() => {
    const f = this.filtro();
    return this.listaPacientes().filter(p =>
      (!f.apellidoPaterno || p.apellidoPaterno?.toLowerCase().includes(f.apellidoPaterno.toLowerCase().trim())) &&
      (!f.apellidoMaterno || p.apellidoMaterno?.toLowerCase().includes(f.apellidoMaterno.toLowerCase().trim())) &&
      (!f.nombres || p.nombres?.toLowerCase().includes(f.nombres.toLowerCase().trim())) &&
      (!f.numDocumento || p.numDocumento?.toLowerCase().includes(f.numDocumento.toLowerCase().trim())) &&
      (!f.telefono || p.telefono?.toLowerCase().includes(f.telefono.toLowerCase().trim()))
    );
  });

  fechaMaxima: string = new Date().toISOString().split('T')[0];

  modoEdicion = false;
  idPacienteEnEdicion: number | null = null;

  nuevoPaciente = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    numDocumento: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: ''
  };

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => this.listaPacientes.set(data),
      error: (err: any) => console.error('Error al cargar pacientes', err)
    });
  }

  actualizarFiltro(campo: string, valor: string) {
    this.filtro.update(actual => ({ ...actual, [campo]: valor }));
  }

  limpiarFiltros() {
    this.filtro.set({
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: '',
      numDocumento: '',
      telefono: ''
    });
  }

  seleccionarParaEditar(p: any) {
    this.modoEdicion = true;
    this.idPacienteEnEdicion = p.idPaciente;
    this.nuevoPaciente = {
      nombres: p.nombres,
      apellidoPaterno: p.apellidoPaterno,
      apellidoMaterno: p.apellidoMaterno,
      numDocumento: p.numDocumento,
      telefono: p.telefono || '',
      direccion: p.direccion || '',
      fechaNacimiento: p.fechaNacimiento || ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(form?: NgForm) {
    this.modoEdicion = false;
    this.idPacienteEnEdicion = null;
    this.nuevoPaciente = {
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      numDocumento: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: ''
    };
    if (form) {
      form.resetForm();
    }
  }

  guardarPaciente(form: NgForm) {
    if (form.invalid) {
      this.toastService.show('Por favor corrija los campos marcados en rojo', 'warning');
      return;
    }

    if (this.nuevoPaciente.fechaNacimiento > this.fechaMaxima) {
      this.toastService.show('La fecha de nacimiento no puede ser mayor a la fecha actual', 'danger');
      return;
    }

    if (this.modoEdicion && this.idPacienteEnEdicion) {
      this.pacienteService.actualizarPaciente(this.idPacienteEnEdicion, this.nuevoPaciente).subscribe({
        next: () => {
          this.toastService.show('¡Paciente actualizado con éxito!', 'success');
          this.cargarPacientes();
          this.cancelarEdicion(form);
        },
        error: (err: any) => {
          console.error('Error al actualizar paciente', err);
          this.toastService.show('Error al actualizar el paciente', 'danger');
        }
      });
    } else {
      this.pacienteService.registrarPaciente(this.nuevoPaciente).subscribe({
        next: () => {
          this.toastService.show('¡Paciente registrado con éxito!', 'success');
          this.cargarPacientes();
          this.cancelarEdicion(form);
        },
        error: (err: any) => {
          console.error('Error al registrar paciente', err);
          this.toastService.show('Error al registrar el paciente', 'danger');
        }
      });
    }
  }

  eliminarPaciente(p: any) {
    if (!confirm(`¿Está seguro de eliminar al paciente ${p.nombres} ${p.apellidoPaterno}?`)) {
      return;
    }

    this.pacienteService.eliminarPaciente(p.idPaciente).subscribe({
      next: () => {
        this.toastService.show('Paciente eliminado correctamente', 'success');
        if (this.idPacienteEnEdicion === p.idPaciente) {
          this.cancelarEdicion();
        }
        this.cargarPacientes();
      },
      error: (err: any) => {
        console.error('Error al eliminar paciente', err);
        const msg = typeof err.error === 'string' ? err.error : 'No se pudo eliminar el paciente';
        this.toastService.show(msg, 'danger');
      }
    });
  }
}