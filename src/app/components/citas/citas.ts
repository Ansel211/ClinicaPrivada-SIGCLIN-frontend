import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { MedicoService } from '../../services/medico.service';
import { ToastService } from '../../services/toast.service';
import { PacienteService } from '../../services/paciente.service'; // <-- 1. Faltaba importar esto

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
  private pacienteService = inject(PacienteService);
  
  todosLosPacientes = signal<any[]>([]);
  todosLosMedicos = signal<any[]>([]);

  especialidadSeleccionada: string = '';
  tipoConsultaSeleccionado: string = '';

  consultasPorEspecialidad: { [especialidad: string]: { [tipo: string]: number } } = {
    'Cardiología': {
      'Primera Cita / Evaluación': 45,
      'Electrocardiograma y Lectura': 30,
      'Control de Hipertensión': 20
    },
    'Odontología': {
      'Evaluación General / Primera Vez': 30,
      'Limpieza / Profilaxis': 40,
      'Curación / Resina': 45
    },
    'Traumatología': {
      'Primera Cita / Diagnóstico': 40,
      'Control y Revisión de Rayos X': 20,
      'Infiltración': 30
    },
    'Cirugía': {
      'Evaluación Pre-quirúrgica': 45,
      'Control Post-operatorio': 20
    },
    'Nutrición': {
      'Evaluación Nutricional Inicial': 45,
      'Control de Progreso': 20
    },
    'Neurología': {
      'Primera Cita / Historial Completo': 50,
      'Control Neurológico': 30
    },
    'Pediatría': {
      'Control de Niño Sano / Vacunas': 30,
      'Consulta por Enfermedad': 30
    },
    'Dermatología': {
      'Evaluación de Lunares / Lesiones': 30,
      'Control de Tratamiento Acné': 20
    }
  };

  get listaEspecialidades(): string[] {
    return Object.keys(this.consultasPorEspecialidad);
  }

  get tiposConsultaDisponibles(): { [tipo: string]: number } {
    if (!this.especialidadSeleccionada) return {};
    return this.consultasPorEspecialidad[this.especialidadSeleccionada] || {};
  }

  get listaTiposConsulta(): string[] {
    return Object.keys(this.tiposConsultaDisponibles);
  }

  get medicosFiltrados() {
    const medicos = this.todosLosMedicos();
    if (!this.especialidadSeleccionada || !Array.isArray(medicos)) return [];
    
    const normalizar = (str: string) => 
      (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    return medicos.filter(
      m => normalizar(m.especialidad) === normalizar(this.especialidadSeleccionada)
    );
  }

  mostrarSelectorHora: boolean = false;
  horaInput: string = '13';
  minutoInput: string = '30';

  nuevaCita = {
    idPaciente: '', 
    idMedico: '',
    fecha: '',
    hora: '13:30',
    duracionMinutos: 30
  };

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarPacientes();
    this.actualizarHoraCompleta();
  }

  cargarMedicos(): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : (data?.content || data?.data || []);
        this.todosLosMedicos.set(lista);
      },
      error: (err: any) => console.error('Error al cargar médicos:', err)
    });
  }

  cargarPacientes(): void {
    // 2. Tipado explícito (data: any[]) y (err: any) para evitar errores de compilación TS7006
    this.pacienteService.listarPacientes().subscribe({
      next: (data: any[]) => this.todosLosPacientes.set(data),
      error: (err: any) => console.error('Error cargando pacientes:', err)
    });
  }

  onEspecialidadChange(): void {
    this.tipoConsultaSeleccionado = ''; 
    this.nuevaCita.idMedico = ''; 
    this.nuevaCita.duracionMinutos = 30;
  }

  onTipoConsultaChange(): void {
    if (this.especialidadSeleccionada && this.tipoConsultaSeleccionado) {
      this.nuevaCita.duracionMinutos = this.consultasPorEspecialidad[this.especialidadSeleccionada][this.tipoConsultaSeleccionado] || 30;
    }
  }

  actualizarHoraCompleta() {
    const h = (this.horaInput || '0').toString().padStart(2, '0');
    const m = (this.minutoInput || '0').toString().padStart(2, '0');
    this.nuevaCita.hora = `${h}:${m}`;
  }

  incrementarHora() {
    let h = parseInt(this.horaInput || '0', 10);
    if (isNaN(h)) h = 0;
    h = (h + 1) % 24;
    this.horaInput = h.toString();
    this.actualizarHoraCompleta();
  }

  decrementarHora() {
    let h = parseInt(this.horaInput || '0', 10);
    if (isNaN(h)) h = 0;
    h = (h - 1 + 24) % 24;
    this.horaInput = h.toString();
    this.actualizarHoraCompleta();
  }

  incrementarMinuto() {
    let m = parseInt(this.minutoInput || '0', 10);
    if (isNaN(m)) m = 0;
    m = (m + 5) % 60;
    this.minutoInput = m.toString();
    this.actualizarHoraCompleta();
  }

  decrementarMinuto() {
    let m = parseInt(this.minutoInput || '0', 10);
    if (isNaN(m)) m = 0;
    m = (m - 5 + 60) % 60;
    this.minutoInput = m.toString();
    this.actualizarHoraCompleta();
  }

  registrarCita(event: Event): void {
    event.preventDefault();

    const idPacienteNum = parseInt(this.nuevaCita.idPaciente, 10);
    const idMedicoNum = parseInt(this.nuevaCita.idMedico, 10);
    this.actualizarHoraCompleta();

    if (isNaN(idPacienteNum) || !this.especialidadSeleccionada || !this.tipoConsultaSeleccionado || isNaN(idMedicoNum) || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      this.toastService.show('Por favor completa todos los campos del formulario.', 'warning');
      return;
    }

    const payload = {
      paciente: { idPaciente: idPacienteNum },
      medico: { id: idMedicoNum },
      fecha: this.nuevaCita.fecha,
      hora: this.nuevaCita.hora,
      duracionMinutos: Number(this.nuevaCita.duracionMinutos),
      tipoConsulta: this.tipoConsultaSeleccionado
    };

    console.log('Payload enviando a Java:', payload);

    this.citaService.registrarCita(payload).subscribe({
      next: () => {
        this.toastService.show('¡Cita registrada con éxito en la base de datos!', 'success');
        this.especialidadSeleccionada = '';
        this.tipoConsultaSeleccionado = '';
        this.horaInput = '13';
        this.minutoInput = '30';
        this.actualizarHoraCompleta();
        this.nuevaCita = { idPaciente: '', idMedico: '', fecha: '', hora: this.nuevaCita.hora, duracionMinutos: 30 };
      },
      error: (err: any) => { // 3. Tipado explícito para 'err' (soluciona TS2571 y TS7006)
        console.error('Error al guardar la cita:', err);
        const errorObj = err.error as any; // Casteo seguro para TypeScript
        const mensaje = typeof errorObj === 'string' 
          ? errorObj 
          : (errorObj?.message || 'Error al guardar la cita');
        this.toastService.show(mensaje, 'danger');
      }
    });
  }
}