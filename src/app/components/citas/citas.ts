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
  fechaMinima: string = new Date().toISOString().split('T')[0];
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

  const idNum = parseInt(this.nuevaCita.idMedico, 10);

  if (!this.nuevaCita.nombrePaciente || isNaN(idNum) || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
    this.toastService.show('Por favor selecciona un médico válido y completa todos los campos.', 'warning');
    return;
  }

  const payload = {
    nombrePaciente: this.nuevaCita.nombrePaciente.trim(),
    medico: {
      id: idNum
    },
    fecha: this.nuevaCita.fecha,
    hora: this.nuevaCita.hora
  };

  console.log('Payload corregido enviando a Java:', payload);

    this.citaService.registrarCita(payload).subscribe({
     next: () => {
      this.toastService.show('¡Cita registrada con éxito en la base de datos!', 'success');
      this.nuevaCita = { nombrePaciente: '', idMedico: '', fecha: '', hora: '' };
    },
    error: (err) => {
      console.error('Error al guardar la cita:', err);
    
    // Extrae el mensaje de texto del backend o usa una alternativa limpia
      const mensaje = typeof err.error === 'string' 
        ? err.error 
        : (err.error?.message || 'Error al guardar la cita');

      this.toastService.show(mensaje, 'danger');
    }
  });
}
}