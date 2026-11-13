import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecetaService } from '../../../services/receta.service';
import { PacienteService } from '../../../services/paciente.service';
import { MedicoService, Medico } from '../../../services/medico.service';
import { ToastService } from '../../../services/toast.service';

interface DetalleRecetaItem {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
}

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recetas.html',
  styleUrl: './recetas.css'
})
export class RecetasComponent implements OnInit {
  private recetaService = inject(RecetaService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private toastService = inject(ToastService);

  listaPacientes = signal<any[]>([]);
  listaMedicos = signal<Medico[]>([]);
  recetasPaciente = signal<any[]>([]);

  pacienteSeleccionadoId: number | null = null;
  medicoSeleccionadoId: number | null = null;
  fechaEmision: string = new Date().toISOString().split('T')[0];
  diagnostico: string = '';
  indicacionesGenerales: string = '';
  firmaConfirmada: boolean = false;

  detalles: DetalleRecetaItem[] = [
    { medicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' }
  ];

  recetaSeleccionadaPDF: any = null;

  ngOnInit(): void {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => this.listaPacientes.set(data),
      error: (err) => console.error('Error al cargar pacientes:', err)
    });

    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.listaMedicos.set(data),
      error: (err) => console.error('Error al cargar médicos:', err)
    });
  }

  onPacienteChange(): void {
    if (!this.pacienteSeleccionadoId) {
      this.recetasPaciente.set([]);
      return;
    }
    this.recetaService.listarPorPaciente(this.pacienteSeleccionadoId).subscribe({
      next: (data) => this.recetasPaciente.set(data),
      error: (err) => console.error('Error al cargar recetas del paciente:', err)
    });
  }

  agregarMedicamento(): void {
    this.detalles.push({ medicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' });
  }

  eliminarMedicamento(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.splice(index, 1);
    }
  }

  emitirReceta(): void {
    const detallesValidos = this.detalles.filter(
      d => d.medicamento.trim() && d.dosis.trim() && d.frecuencia.trim() && d.duracion.trim()
    );

    if (!this.pacienteSeleccionadoId || !this.medicoSeleccionadoId || !this.diagnostico.trim()) {
      this.toastService.showError('Seleccione paciente, médico e ingrese el diagnóstico.');
      return;
    }

    if (detallesValidos.length === 0) {
      this.toastService.showError('Agregue al menos un medicamento completo con dosis, frecuencia y duración.');
      return;
    }

    if (!this.firmaConfirmada) {
      this.toastService.showError('Debe validar y firmar digitalmente la receta antes de emitirla.');
      return;
    }

    const payload = {
      fechaEmision: this.fechaEmision,
      diagnostico: this.diagnostico,
      indicacionesGenerales: this.indicacionesGenerales,
      paciente: { idPaciente: Number(this.pacienteSeleccionadoId) },
      medico: { id: Number(this.medicoSeleccionadoId) },
      detalles: detallesValidos
    };

    this.recetaService.emitirReceta(payload).subscribe({
      next: (recetaCreada) => {
        this.toastService.showSuccess('Receta electrónica emitida y firmada digitalmente.');
        this.onPacienteChange();
        this.recetaSeleccionadaPDF = recetaCreada;
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Error al emitir receta:', err);
        this.toastService.showError('Error al emitir la receta médica.');
      }
    });
  }

  limpiarFormulario(): void {
    this.diagnostico = '';
    this.indicacionesGenerales = '';
    this.firmaConfirmada = false;
    this.detalles = [{ medicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' }];
  }

  abrirVistaPDF(receta: any): void {
    this.recetaSeleccionadaPDF = receta;
  }

  cerrarVistaPDF(): void {
    this.recetaSeleccionadaPDF = null;
  }

  imprimirPDF(): void {
    window.print();
  }
}