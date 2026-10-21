import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { MedicoService } from '../../services/medico.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class CitasComponent implements OnInit {
  private citaService = inject(CitaService);
  private medicoService = inject(MedicoService);
  private toastService = inject(ToastService);

  // Lista para llenar el select del formulario
  medicosDisponibles = signal<any[]>([]);

  // Modelo del formulario de la cita
  nuevaCita = {
    nombrePaciente: '',
    idMedico: '',
    fecha: '',
    hora: ''
  };

  ngOnInit(): void {
    this.cargarMedicosParaSelect();
  }

  // Carga los médicos solo para poder asignarlos en el select
  cargarMedicosParaSelect(): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.medicosDisponibles.set(data),
      error: (err) => console.error('Error al cargar médicos:', err)
    });
  }

  validarFormatoNombre(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-ZA-Za-zA-Za-zñÑ\s]/g, '');
    this.nuevaCita.nombrePaciente = input.value;
  }

  registrarCita(event: Event): void {
    event.preventDefault();

    if (!this.nuevaCita.nombrePaciente || !this.nuevaCita.idMedico || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      this.toastService.show('Por favor completa todos los campos de la cita.', 'warning');
      return;
    }

    const payload = {
      nombrePaciente: this.nuevaCita.nombrePaciente.trim(),
      idMedico: Number(this.nuevaCita.idMedico),
      fecha: this.nuevaCita.fecha,
      hora: this.nuevaCita.hora
    };

    this.citaService.registrarCita(payload).subscribe({
      next: () => {
        this.toastService.show('¡Cita registrada con éxito en la base de datos!', 'success');
        this.nuevaCita = { nombrePaciente: '', idMedico: '', fecha: '', hora: '' };
      },
      error: (err) => {
        console.error('Error al guardar la cita:', err);
        this.toastService.show('Hubo un error al registrar la cita en la base de datos.', 'danger');
      }
    });
  }
}