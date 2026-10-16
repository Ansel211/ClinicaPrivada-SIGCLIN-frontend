import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService, Medico } from '../../services/medico.service';
import { CitaService } from '../../services/cita.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class Citas implements OnInit {
  private toastService = inject(ToastService);
  private medicoService = inject(MedicoService);
  private citaService = inject(CitaService);

  fechaMinima: string = '';
  medicosDisponibles = signal<Medico[]>([]);
  
  nuevaCita = {
    nombrePaciente: '',
    idMedico: '',
    fecha: '',
    hora: ''
  };

  ngOnInit(): void {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    this.fechaMinima = `${year}-${month}-${day}`;
    this.nuevaCita.fecha = this.fechaMinima;

    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.medicosDisponibles.set(data);
      },
      error: (err) => {
        console.error('Error al cargar los médicos desde la BD:', err);
      }
    });
  }

  registrarCita(event: Event): void {
    event.preventDefault();
    const nombreLimpio = this.nuevaCita.nombrePaciente.trim();

    if (!nombreLimpio || nombreLimpio.length < 2) {
      this.toastService.show('Por favor ingrese un nombre de paciente válido.', 'danger');
      return;
    }

    if (!this.nuevaCita.idMedico || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      this.toastService.show('Por favor complete todos los campos requeridos.', 'danger');
      return;
    }

    const payload = {
      nombrePaciente: nombreLimpio,
      idMedico: Number(this.nuevaCita.idMedico),
      fecha: this.nuevaCita.fecha,
      hora: this.nuevaCita.hora
    };

    this.citaService.registrarCita(payload).subscribe({
      next: (response) => {
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