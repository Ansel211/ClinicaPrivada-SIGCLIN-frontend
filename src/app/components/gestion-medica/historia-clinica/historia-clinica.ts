import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HistoriaClinicaService } from '../../../services/historia-clinica.service';
import { PacienteService } from '../../../services/paciente.service';
import { MedicoService, Medico } from '../../../services/medico.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historia-clinica.html',
  styleUrl: './historia-clinica.css'
})
export class HistoriaClinicaComponent implements OnInit {
  private historiaService = inject(HistoriaClinicaService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private toastService = inject(ToastService);

  listaPacientes = signal<any[]>([]);
  listaMedicos = signal<Medico[]>([]);
  historialPaciente = signal<any[]>([]);

  pacienteSeleccionadoId: number | null = null;
  medicoSeleccionadoId: number | null = null;

  nuevaConsulta = {
    fechaAtencion: new Date().toISOString().split('T')[0],
    anamnesis: '',
    diagnostico: '',
    tratamiento: ''
  };

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => this.listaPacientes.set(data),
      error: (err: any) => console.error('Error al cargar pacientes:', err)
    });

    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.listaMedicos.set(data),
      error: (err: any) => console.error('Error al cargar médicos:', err)
    });
  }

  onPacienteChange(): void {
    if (!this.pacienteSeleccionadoId) {
      this.historialPaciente.set([]);
      return;
    }

    this.historiaService.listarPorPaciente(this.pacienteSeleccionadoId).subscribe({
      next: (data) => this.historialPaciente.set(data),
      error: (err: any) => console.error('Error al cargar historial del paciente:', err)
    });
  }

  guardarConsulta(form: NgForm): void {
    if (form.invalid || !this.pacienteSeleccionadoId || !this.medicoSeleccionadoId) {
      this.toastService.show('Complete todos los campos obligatorios y seleccione paciente y médico.', 'warning');
      return;
    }

    const payload = {
      fechaAtencion: this.nuevaConsulta.fechaAtencion,
      anamnesis: this.nuevaConsulta.anamnesis,
      diagnostico: this.nuevaConsulta.diagnostico,
      tratamiento: this.nuevaConsulta.tratamiento,
      paciente: { idPaciente: Number(this.pacienteSeleccionadoId) },
      medico: { id: Number(this.medicoSeleccionadoId) }
    };

    this.historiaService.registrarHistoria(payload).subscribe({
      next: () => {
        this.toastService.show('Evolución médica registrada en la Historia Clínica.', 'success');
        this.onPacienteChange();
        this.nuevaConsulta = {
          fechaAtencion: new Date().toISOString().split('T')[0],
          anamnesis: '',
          diagnostico: '',
          tratamiento: ''
        };
        form.resetForm({
          fechaAtencion: this.nuevaConsulta.fechaAtencion,
          pacienteId: this.pacienteSeleccionadoId,
          medicoId: this.medicoSeleccionadoId
        });
      },
      error: (err: any) => {
        console.error('Error al guardar historia clínica:', err);
        this.toastService.show('Error al registrar la consulta médica.', 'danger');
      }
    });
  }
}