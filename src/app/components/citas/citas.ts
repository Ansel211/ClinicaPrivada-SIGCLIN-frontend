import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  todosLosMedicos = signal<any[]>([]);

  especialidadSeleccionada: string = '';
  tipoConsultaSeleccionado: string = '';

  // Diccionario sincronizado exactamente con los textos de tu BD de Supabase
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

  // Obtener lista de especialidades
  get listaEspecialidades(): string[] {
    return Object.keys(this.consultasPorEspecialidad);
  }

  // Obtiene los tipos de consulta específicos de la especialidad elegida
  get tiposConsultaDisponibles(): { [tipo: string]: number } {
    if (!this.especialidadSeleccionada) return {};
    return this.consultasPorEspecialidad[this.especialidadSeleccionada] || {};
  }

  get listaTiposConsulta(): string[] {
    return Object.keys(this.tiposConsultaDisponibles);
  }

  // Filtrar medicos como un getter tradicional para que reaccione al cambio de especialidad
  get medicosFiltrados() {
    const medicos = this.todosLosMedicos();
    if (!this.especialidadSeleccionada || !Array.isArray(medicos)) return [];
    
    const normalizar = (str: string) => 
      (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const filtrados = medicos.filter(
      m => normalizar(m.especialidad) === normalizar(this.especialidadSeleccionada)
    );

    console.log('Especialidad seleccionada:', this.especialidadSeleccionada);
    console.log('Médicos filtrados:', filtrados);

    return filtrados;
  }

  mostrarSelectorHora: boolean = false;
  horaInput: string = '13';
  minutoInput: string = '30';

  nuevaCita = {
    nombrePaciente: '',
    idMedico: '',
    fecha: '',
    hora: '13:30',
    duracionMinutos: 30
  };

  ngOnInit(): void {
    this.cargarMedicos();
    this.actualizarHoraCompleta();
  }

  cargarMedicos(): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data: any) => {
        // Aseguramos que cargue como arreglo sin importar si viene envuelto
        const lista = Array.isArray(data) ? data : (data?.content || data?.data || []);
        console.log('Médicos totales cargados desde BD:', lista);
        this.todosLosMedicos.set(lista);
      },
      error: (err) => console.error('Error al cargar médicos:', err)
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

  validarFormatoNombre(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-ZA-Za-zA-Za-zñÑ\s]/g, '');
    this.nuevaCita.nombrePaciente = input.value;
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

    const idNum = parseInt(this.nuevaCita.idMedico, 10);
    this.actualizarHoraCompleta();

    if (!this.nuevaCita.nombrePaciente || !this.especialidadSeleccionada || !this.tipoConsultaSeleccionado || isNaN(idNum) || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      this.toastService.show('Por favor completa todos los campos del formulario.', 'warning');
      return;
    }

    const payload = {
      nombrePaciente: this.nuevaCita.nombrePaciente.trim(),
      medico: { id: idNum },
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
        this.nuevaCita = { nombrePaciente: '', idMedico: '', fecha: '', hora: this.nuevaCita.hora, duracionMinutos: 30 };
      },
      error: (err) => {
        console.error('Error al guardar la cita:', err);
        const mensaje = typeof err.error === 'string' 
          ? err.error 
          : (err.error?.message || 'Error al guardar la cita');
        this.toastService.show(mensaje, 'danger');
      }
    });
  }
}