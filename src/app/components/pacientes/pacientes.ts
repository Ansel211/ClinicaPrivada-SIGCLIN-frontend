import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PacienteService } from '../../services/paciente.service';
import { ToastService } from '../../services/toast.service';

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

  fechaMaxima: string = new Date().toISOString().split('T')[0];

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
      error: (err) => console.error('Error al cargar pacientes', err)
    });
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
    this.pacienteService.registrarPaciente(this.nuevoPaciente).subscribe({
      next: () => {
        this.toastService.show('¡Paciente registrado con éxito!', 'success');
        this.cargarPacientes();
        this.nuevoPaciente = { nombres: '', apellidoPaterno: '', apellidoMaterno: '', numDocumento: '', telefono: '', direccion: '', fechaNacimiento: '' };
      },
      error: (err) => {
        console.error('Error al registrar paciente', err);
        this.toastService.show('Error al registrar el paciente', 'danger');
      }
    });
  }
}