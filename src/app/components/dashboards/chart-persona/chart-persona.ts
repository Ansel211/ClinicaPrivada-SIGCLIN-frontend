import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexChart,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers
} from 'ng-apexcharts';
import { CitaService } from '../../../services/cita.service';
import { SessionService } from '../../../services/session.service';
import { NCitasXMedico } from '../../../model/api/response/ncitas-xmedico';

export type ChartOptionsRadar = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  colors: string[];
};

export type ChartOptionsTreemap = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
};

export type ChartOptionsArea = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  colors: string[];
};

@Component({
  selector: 'app-chart-persona',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './chart-persona.html',
  styleUrl: './chart-persona.css'
})
export class ChartPersona implements OnInit {
  private citaService = inject(CitaService);
  private sessionService = inject(SessionService);
  private cdr = inject(ChangeDetectorRef);

  // Datos del usuario para el Banner de Bienvenida
  public nombreUsuario: string = 'Usuario';
  public rolUsuario: string = 'Personal Clínico';
  public fechaActual: Date = new Date();

  // Indicadores rápidos (KPIs)
  public totalCitas: number = 0;
  public totalMedicosActivos: number = 0;
  public especialidadTop: string = 'Cargando...';
  public citasPendientes: number = 0;

  // Gráfico 1: Radar (Demanda de Citas por Especialidad Médica)
  public chartOptionsRadar: Partial<ChartOptionsRadar> = {
    series: [{ name: 'Citas', data: [] }],
    chart: { type: 'radar', height: 360, toolbar: { show: false } },
    title: { text: 'Demanda por Especialidad Médica', align: 'center' },
    xaxis: { categories: [] },
    yaxis: { show: false },
    stroke: { width: 2 },
    fill: { opacity: 0.25 },
    markers: { size: 4 },
    colors: ['#008FFB']
  };

  // Gráfico 2: Treemap (Carga de Citas por Médico)
  public chartOptionsTreemap: Partial<ChartOptionsTreemap> = {
    series: [{ name: 'Citas', data: [] }],
    chart: { type: 'treemap', height: 360, toolbar: { show: false } },
    title: { text: 'Carga de Citas por Médico', align: 'center' },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false
      }
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '12px', fontWeight: 'bold' },
      formatter: (text: string, op: any) => `${text}: ${op.value}`
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5', '#546E7A', '#D4526E']
  };

  // Gráfico 3: Área (Tendencia de Citas por Fecha con barra de zoom)
  public chartOptionsArea: Partial<ChartOptionsArea> = {
    series: [],
    chart: { type: 'area', height: 360, toolbar: { show: true } },
    title: { text: 'Tendencia de Citas por Fecha', align: 'left', margin: 15 },
    xaxis: { categories: [] },
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    colors: ['#008FFB']
  };

  ngOnInit(): void {
    this.cargarDatosSesion();
    this.getCitasPorEspecialidadCharts();
    this.getNCitasMedicoCharts();
    this.getCitasPorFechaCharts();
  }

  private cargarDatosSesion(): void {
    const sesion = this.sessionService.getInfoSession();
    if (sesion) {
      this.nombreUsuario = sesion.names || sesion.email;
      const rolObj: any = sesion.rol;
      const codigoRol = typeof rolObj === 'string' ? rolObj : (rolObj?.codigo || rolObj?.descripcion || '');
      const mapaRoles: Record<string, string> = {
        ADMIN: 'Administrador del Sistema',
        MEDICO: 'Médico Especialista',
        RECEPCION: 'Admisión y Recepción'
      };
      this.rolUsuario = mapaRoles[codigoRol] || rolObj?.descripcion || codigoRol || 'Personal Clínico';
    }
  }

  // 1. Agrupa las citas reales por la especialidad del médico asignado
  getCitasPorEspecialidadCharts(): void {
    this.citaService.listarCitas().subscribe({
      next: (citas: any[]) => {
        if (!citas || citas.length === 0) {
          this.especialidadTop = 'Sin registros';
          return;
        }

        this.totalCitas = citas.length;
        this.citasPendientes = citas.filter(c => c.estado?.toLowerCase() === 'pendiente').length;

        const conteo: { [esp: string]: number } = {};
        for (const c of citas) {
          if (c.estado && c.estado.toLowerCase() === 'cancelada') continue;
          const esp = c.medico?.especialidad || 'General';
          conteo[esp] = (conteo[esp] || 0) + 1;
        }

        const especialidades = Object.keys(conteo);
        const cantidades = Object.values(conteo);

        if (especialidades.length > 0) {
          const maxIdx = cantidades.indexOf(Math.max(...cantidades));
          this.especialidadTop = especialidades[maxIdx];
        } else {
          this.especialidadTop = 'Sin registros';
        }

        this.chartOptionsRadar = {
          ...this.chartOptionsRadar,
          series: [{ name: 'Citas registradas', data: cantidades }],
          xaxis: { categories: especialidades }
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar citas por especialidad:', err)
    });
  }

  // 2. Carga de citas por médico usando NCitasXMedico (nombreMedico, cantidadCitas)
  getNCitasMedicoCharts(): void {
    this.citaService.getNCitasXMedico().subscribe({
      next: (data: NCitasXMedico[]) => {
        if (!data || data.length === 0) return;

        const puntosTreemap = data
          .filter(d => d.cantidadCitas > 0)
          .map(d => ({
            x: d.nombreMedico,
            y: d.cantidadCitas
          }));

        this.totalMedicosActivos = puntosTreemap.length;

        this.chartOptionsTreemap = {
          ...this.chartOptionsTreemap,
          series: [{ name: 'Citas', data: puntosTreemap }]
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar citas por médico:', err)
    });
  }

  // 3. Tendencia histórica de citas por fecha (Gráfico de Área)
  getCitasPorFechaCharts(): void {
    this.citaService.getCitasPorFecha().subscribe({
      next: (data) => {
        if (!data || data.length === 0) return;

        const fechas = data.map(d => d.fecha);
        const cantidades = data.map(d => d.cantidad);

        this.chartOptionsArea = {
          ...this.chartOptionsArea,
          series: [{ name: 'Citas', data: cantidades }],
          xaxis: { categories: fechas }
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar citas por fecha:', err)
    });
  }
}