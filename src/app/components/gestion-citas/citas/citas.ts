import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CitaService,
  TurnoSemanal,
  CitaBloqueSemanal
} from '../../../services/cita.service';
import { MedicoService } from '../../../services/medico.service';
import { ToastService } from '../../../services/toast.service';
import { PacienteService } from '../../../services/paciente.service';

interface DiaColumna {
  diaSemana: number;   // 1=Lunes ... 7=Domingo
  nombreCorto: string; // 'LUN', 'MAR'...
  numeroDia: number;   // 16, 17...
  fechaISO: string;    // '2026-11-16'
  esPasado: boolean;
}

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
  private pacienteService = inject(PacienteService);

  fechaMinima: string = this.formatearFechaISO(new Date());

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

  nuevaCita = {
    idPaciente: '',
    idMedico: '',
    fecha: '',
    hora: '',
    duracionMinutos: 30
  };

  // --- CONFIGURACIÓN DE LA GRILLA SEMANAL (07:00 a 20:00 en pasos de 5 min) ---
  readonly horaInicioGrilla = 7;
  readonly horaFinGrilla = 20;
  readonly pxPorMinuto = 1.4; // 84px por hora para visualizar bien citas cortas de 20 min

  horasEtiquetas: { hora: string; minutosDesdeInicio: number; esHoraEnPunto: boolean }[] = [];
  slots5Min: { hora: string; minutosDesdeInicio: number }[] = [];

  lunesActual!: Date;
  diasSemana: DiaColumna[] = [];
  mesSelector: string = '';

  turnosMedico = signal<TurnoSemanal[]>([]);
  citasSemana = signal<CitaBloqueSemanal[]>([]);
  slotsDisponiblesPorDia = signal<{ [fechaISO: string]: { hora: string; minutosDesdeInicio: number }[] }>({});
  slotHover = signal<{ fechaISO: string; hora: string } | null>(null);
  cargandoAgenda = signal<boolean>(false);

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
      (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    return medicos.filter(
      m => normalizar(m.especialidad) === normalizar(this.especialidadSeleccionada)
    );
  }
  
  get medicoSeleccionadoObj(): any {
    return this.medicosFiltrados.find(
      m => String(m.id ?? m.idMedico) === String(this.nuevaCita.idMedico)
    );
  }

  get medicoNoDisponible(): boolean {
    const med = this.medicoSeleccionadoObj;
    if (!med || !med.disponibilidad) return false;
    return med.disponibilidad.toLowerCase().trim() !== 'disponible';
  }

  get fechaEsPasada(): boolean {
    if (!this.nuevaCita.fecha) return false;
    return this.nuevaCita.fecha < this.fechaMinima;
  }

  get alturaTotalGrilla(): number {
    return (this.horaFinGrilla - this.horaInicioGrilla) * 60 * this.pxPorMinuto;
  }

  get tituloRangoSemana(): string {
    if (this.diasSemana.length < 7) return '';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const inicio = this.parsearFechaLocal(this.diasSemana[0].fechaISO);
    const fin = this.parsearFechaLocal(this.diasSemana[6].fechaISO);

    if (inicio.getMonth() === fin.getMonth()) {
      return `${inicio.getDate()} – ${fin.getDate()} ${meses[inicio.getMonth()]} ${inicio.getFullYear()}`;
    }
    return `${inicio.getDate()} ${meses[inicio.getMonth()]} – ${fin.getDate()} ${meses[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  ngOnInit(): void {
    this.construirEjeHoras();
    this.irASemanaDeFecha(new Date());
    this.cargarMedicos();
    this.cargarPacientes();
  }

  private construirEjeHoras(): void {
    const inicioMin = this.horaInicioGrilla * 60;
    const finMin = this.horaFinGrilla * 60;

    for (let m = inicioMin; m < finMin; m += 30) {
      this.horasEtiquetas.push({
        hora: this.minutosAHora(m),
        minutosDesdeInicio: m - inicioMin,
        esHoraEnPunto: m % 60 === 0
      });
    }

    // Pasos de 5 minutos para permitir agendar justo al terminar cualquier cita (ej. 10:20, 10:05)
    for (let m = inicioMin; m < finMin; m += 5) {
      this.slots5Min.push({
        hora: this.minutosAHora(m),
        minutosDesdeInicio: m - inicioMin
      });
    }
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
    this.pacienteService.listarPacientes().subscribe({
      next: (data: any[]) => this.todosLosPacientes.set(data),
      error: (err: any) => console.error('Error cargando pacientes:', err)
    });
  }

  onEspecialidadChange(): void {
    this.tipoConsultaSeleccionado = '';
    this.nuevaCita.idMedico = '';
    this.nuevaCita.duracionMinutos = 30;
    this.nuevaCita.fecha = '';
    this.nuevaCita.hora = '';
    this.turnosMedico.set([]);
    this.citasSemana.set([]);
    this.slotsDisponiblesPorDia.set({});
  }

  onTipoConsultaChange(): void {
    if (this.especialidadSeleccionada && this.tipoConsultaSeleccionado) {
      this.nuevaCita.duracionMinutos =
        this.consultasPorEspecialidad[this.especialidadSeleccionada][this.tipoConsultaSeleccionado] || 30;

      this.recalcularSlotsDisponibles();

      if (this.nuevaCita.fecha && this.nuevaCita.hora) {
        const dia = this.diasSemana.find(d => d.fechaISO === this.nuevaCita.fecha);
        if (dia && !this.puedeAgendarEn(dia, this.nuevaCita.hora)) {
          this.nuevaCita.hora = '';
          this.toastService.show(
            'Con la nueva duración el horario elegido se cruza o sale de turno. Elige otra hora.',
            'warning'
          );
        }
      }
    }
  }

  onMedicoChange(): void {
    this.nuevaCita.hora = '';
    if (this.nuevaCita.fecha) {
      this.irASemanaDeFecha(this.parsearFechaLocal(this.nuevaCita.fecha));
    } else {
      this.cargarAgendaSemanal();
    }
  }

  // --- SINCRONIZACIÓN CON INPUTS MANUALES DE FECHA Y HORA ---

  onFechaManualChange(nuevaFecha: string): void {
    if (!nuevaFecha) return;
    this.nuevaCita.fecha = nuevaFecha;

    if (nuevaFecha < this.fechaMinima) {
      this.toastService.show('No se permiten fechas pasadas. Selecciona hoy o una fecha futura.', 'warning');
      return;
    }

    this.irASemanaDeFecha(this.parsearFechaLocal(nuevaFecha));
  }

  onHoraManualChange(nuevaHora: string): void {
    if (!nuevaHora) return;
    this.nuevaCita.hora = nuevaHora.substring(0, 5);

    if (this.nuevaCita.fecha && this.nuevaCita.idMedico && this.turnosMedico().length > 0) {
      const dia = this.diasSemana.find(d => d.fechaISO === this.nuevaCita.fecha);
      if (dia && !this.puedeAgendarEn(dia, this.nuevaCita.hora)) {
        this.toastService.show(
          'Atención: esa hora cae fuera del turno del médico o choca con una cita azul.',
          'warning'
        );
      }
    }
  }

  // --- NAVEGACIÓN POR SEMANAS Y MESES ---

  irASemanaDeFecha(fechaBase: Date): void {
    const f = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
    const dia = f.getDay();
    const diffALunes = dia === 0 ? -6 : 1 - dia;
    f.setDate(f.getDate() + diffALunes);

    this.lunesActual = f;
    this.mesSelector = `${fechaBase.getFullYear()}-${(fechaBase.getMonth() + 1).toString().padStart(2, '0')}`;
    this.generarColumnasSemana();
    this.cargarAgendaSemanal();
  }

  irAHoy(): void {
    this.irASemanaDeFecha(new Date());
  }

  cambiarSemana(deltaSemanas: number): void {
    const nueva = new Date(this.lunesActual);
    nueva.setDate(nueva.getDate() + deltaSemanas * 7);
    this.irASemanaDeFecha(nueva);
  }

  onMesChange(valorMes: string): void {
    if (!valorMes) return;
    const [anio, mes] = valorMes.split('-').map(Number);
    const hoy = new Date();

    if (anio === hoy.getFullYear() && mes - 1 === hoy.getMonth()) {
      this.irASemanaDeFecha(hoy);
      return;
    }

    const primeroDelMes = new Date(anio, mes - 1, 1);
    const diaSemana = primeroDelMes.getDay();
    const offsetPrimerLunes = diaSemana === 0 ? 1 : (diaSemana === 1 ? 0 : 8 - diaSemana);
    primeroDelMes.setDate(1 + offsetPrimerLunes);
    this.irASemanaDeFecha(primeroDelMes);
  }

  private generarColumnasSemana(): void {
    const nombres = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    const hoyISO = this.formatearFechaISO(new Date());
    const cols: DiaColumna[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(this.lunesActual);
      d.setDate(this.lunesActual.getDate() + i);
      const iso = this.formatearFechaISO(d);
      cols.push({
        diaSemana: i + 1,
        nombreCorto: nombres[i],
        numeroDia: d.getDate(),
        fechaISO: iso,
        esPasado: iso < hoyISO
      });
    }
    this.diasSemana = cols;
  }

  cargarAgendaSemanal(): void {
    if (!this.nuevaCita.idMedico || this.diasSemana.length < 7) {
      this.slotsDisponiblesPorDia.set({});
      return;
    }

    this.cargandoAgenda.set(true);
    const idMed = parseInt(this.nuevaCita.idMedico, 10);
    const fechaInicio = this.diasSemana[0].fechaISO;
    const fechaFin = this.diasSemana[6].fechaISO;

    this.citaService.obtenerAgendaSemanal(idMed, fechaInicio, fechaFin).subscribe({
      next: (resp) => {
        this.turnosMedico.set(resp.turnos || []);
        this.citasSemana.set(resp.citas || []);
        this.recalcularSlotsDisponibles();
        this.cargandoAgenda.set(false);
      },
      error: (err) => {
        console.error('Error al cargar agenda semanal:', err);
        this.turnosMedico.set([]);
        this.citasSemana.set([]);
        this.slotsDisponiblesPorDia.set({});
        this.cargandoAgenda.set(false);
        this.toastService.show('No se pudo cargar el horario del médico.', 'danger');
      }
    });
  }

  private recalcularSlotsDisponibles(): void {
    const mapa: { [fechaISO: string]: { hora: string; minutosDesdeInicio: number }[] } = {};
    for (const dia of this.diasSemana) {
      mapa[dia.fechaISO] = this.slots5Min.filter(s => this.puedeAgendarEn(dia, s.hora));
    }
    this.slotsDisponiblesPorDia.set(mapa);
  }

  // --- CÁLCULO VISUAL DE TURNOS, CITAS OCUPADAS (AZUL) Y SELECCIÓN (VERDE) ---

  getTurnosDeDia(diaSemana: number): TurnoSemanal[] {
    return this.turnosMedico().filter(t => t.diaSemana === diaSemana);
  }

  getCitasDeFecha(fechaISO: string): CitaBloqueSemanal[] {
    return this.citasSemana().filter(c => c.fecha === fechaISO);
  }

  calcularTopPx(hora: string): number {
    const min = this.horaAMinutos(hora) - this.horaInicioGrilla * 60;
    return Math.max(0, min * this.pxPorMinuto);
  }

  calcularAlturaPx(duracionMinutos: number): number {
    return Math.max(18, duracionMinutos * this.pxPorMinuto);
  }

  calcularAlturaTurnoPx(horaInicio: string, horaFin: string): number {
    const diff = this.horaAMinutos(horaFin) - this.horaAMinutos(horaInicio);
    return Math.max(0, diff * this.pxPorMinuto);
  }

  calcularHoraFin(horaInicio: string, duracionMinutos: number): string {
    return this.minutosAHora(this.horaAMinutos(horaInicio) + duracionMinutos);
  }

  puedeAgendarEn(dia: DiaColumna, horaSlot: string): boolean {
    if (dia.esPasado) return false;

    const inicioPropuesto = this.horaAMinutos(horaSlot);
    const duracion = this.nuevaCita.duracionMinutos || 30;
    const finPropuesto = inicioPropuesto + duracion;

    const dentroDeTurno = this.getTurnosDeDia(dia.diaSemana).some(t => {
      const tIni = this.horaAMinutos(t.horaInicio);
      const tFin = this.horaAMinutos(t.horaFin);
      return inicioPropuesto >= tIni && finPropuesto <= tFin;
    });
    if (!dentroDeTurno) return false;

    const chocaCita = this.getCitasDeFecha(dia.fechaISO).some(c => {
      const cIni = this.horaAMinutos(c.horaInicio);
      const cFin = cIni + (c.duracionMinutos || 30);
      return inicioPropuesto < cFin && finPropuesto > cIni;
    });

    return !chocaCita;
  }

  onSlotHover(dia: DiaColumna, horaSlot: string): void {
    this.slotHover.set({ fechaISO: dia.fechaISO, hora: horaSlot });
  }

  onSlotLeave(): void {
    this.slotHover.set(null);
  }

  seleccionarBloque(dia: DiaColumna, horaSlot: string): void {
    if (!this.tipoConsultaSeleccionado) {
      this.toastService.show('Selecciona primero el Tipo de Consulta para saber su duración.', 'warning');
      return;
    }
    if (!this.puedeAgendarEn(dia, horaSlot)) {
      return;
    }
    this.nuevaCita.fecha = dia.fechaISO;
    this.nuevaCita.hora = horaSlot;
    this.slotHover.set(null);
  }

  // --- HELPERS DE FECHA Y HORA ---

  private horaAMinutos(hora: string): number {
    const [h, m] = (hora || '00:00').split(':').map(Number);
    return h * 60 + m;
  }

  private minutosAHora(totalMinutos: number): string {
    const h = Math.floor(totalMinutos / 60).toString().padStart(2, '0');
    const m = (totalMinutos % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private formatearFechaISO(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parsearFechaLocal(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // --- REGISTRO DE CITA ---

  registrarCita(event: Event): void {
    event.preventDefault();

    const idPacienteNum = parseInt(this.nuevaCita.idPaciente, 10);
    const idMedicoNum = parseInt(this.nuevaCita.idMedico, 10);

    if (
      isNaN(idPacienteNum) ||
      !this.especialidadSeleccionada ||
      !this.tipoConsultaSeleccionado ||
      isNaN(idMedicoNum) ||
      !this.nuevaCita.fecha ||
      !this.nuevaCita.hora
    ) {
      this.toastService.show('Completa todos los campos y selecciona fecha y hora.', 'warning');
      return;
    }

    if (this.fechaEsPasada) {
      this.toastService.show('No se puede registrar una cita en una fecha pasada.', 'danger');
      return;
    }

    if (this.medicoNoDisponible) {
      this.toastService.show('El médico seleccionado figura como no disponible / ocupado.', 'danger');
      return;
    }

    if (this.turnosMedico().length === 0) {
      this.toastService.show('El médico seleccionado no tiene turnos configurados.', 'danger');
      return;
    }

    const diaElegido = this.diasSemana.find(d => d.fechaISO === this.nuevaCita.fecha);
    if (diaElegido && !this.puedeAgendarEn(diaElegido, this.nuevaCita.hora)) {
      this.toastService.show('La hora elegida está fuera del turno del médico o se cruza con otra cita.', 'danger');
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

    this.citaService.registrarCita(payload).subscribe({
      next: () => {
        this.toastService.show('¡Cita registrada con éxito!', 'success');
        this.nuevaCita.hora = '';
        this.cargarAgendaSemanal();
      },
      error: (err: any) => {
        console.error('Error al guardar la cita:', err);
        const errorObj = err.error as any;
        const mensaje =
          typeof errorObj === 'string'
            ? errorObj
            : errorObj?.message || 'Error al guardar la cita';
        this.toastService.show(mensaje, 'danger');
      }
    });
  }
}