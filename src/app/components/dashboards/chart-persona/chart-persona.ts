import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NgApexchartsModule, 
  ApexChart, 
  ApexAxisChartSeries, 
  ApexTitleSubtitle, 
  ApexLegend, 
  ApexXAxis, 
  ApexStroke, 
  ApexDataLabels 
} from 'ng-apexcharts';
import { PersonaService } from '../../../services/persona.service';
import { CitaService } from '../../../services/cita.service'; // <-- Importado para el 3er gráfico
import { ChartCitaComponent } from '../chart-cita/chart-cita';

export type ChartOptionsDonut = {
  series: number[];
  chart: ApexChart;
  title: ApexTitleSubtitle;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
};

// Tipo para la configuración del Gráfico de Área
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
  imports: [CommonModule, NgApexchartsModule, ChartCitaComponent],
  templateUrl: './chart-persona.html',
  styleUrl: './chart-persona.css'
})
export class ChartPersona implements OnInit {
  private personaService = inject(PersonaService);
  private citaService = inject(CitaService); // <-- Inyectado
  private cdr = inject(ChangeDetectorRef);

  public chartOptionsDonut: Partial<ChartOptionsDonut> = {
    series: [],
    chart: { type: 'donut', height: 350 },
    title: { text: 'Proporción de Usuarios por Rol', align: 'center' },
    labels: [],
    colors: []
  };

  // Configuración inicial del 3er Gráfico (Área)
  public chartOptionsArea: Partial<ChartOptionsArea> = {
    series: [],
    chart: { type: 'area', height: 350 },
    title: { text: 'Tendencia de Citas Registradas por Fecha', align: 'center' },
    xaxis: { categories: [] },
    stroke: { curve: 'smooth' },
    dataLabels: { enabled: false },
    colors: ['#00E396']
  };

  ngOnInit(): void {
    this.getNUsuariosXRolCharts();
    this.getCitasPorFechaCharts(); // <-- Llamada para obtener los datos del 3er gráfico
  }

  private getRandomColors(count: number): string[] {
    const palette = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5'];
    return palette.slice(0, count);
  }

  getNUsuariosXRolCharts(): void {
    this.personaService.getNUsuariosXRol().subscribe({
      next: (data) => {
        console.log('Respuesta backend NUsuariosXRol:', data);

        if (!data || data.length === 0) return;

        const descripciones = data.map(d => d.descripcion);
        const cantidades = data.map(d => d.cantidad);
        const colores = this.getRandomColors(data.length);

        this.chartOptionsDonut = {
          series: cantidades,
          chart: { type: 'donut', height: 350 },
          title: { text: 'Proporción de Usuarios por Rol', align: 'center' },
          labels: descripciones,
          colors: colores,
          legend: { position: 'bottom' }
        };

        this.cdr.detectChanges(); // Forzar actualización de plantilla
      },
      error: (err) => console.error('Error al cargar usuarios por rol:', err)
    });
  }

  // Método para poblar el 3er Gráfico de Área
  getCitasPorFechaCharts(): void {
    this.citaService.getCitasPorFecha().subscribe({
      next: (data) => {
        console.log('Respuesta backend CitasPorFecha:', data);

        if (!data || data.length === 0) return;

        const fechas = data.map(d => d.fecha);
        const cantidades = data.map(d => d.cantidad);

        this.chartOptionsArea = {
          series: [{ name: 'Citas', data: cantidades }],
          chart: { type: 'area', height: 350 },
          title: { text: 'Tendencia de Citas Registradas por Fecha', align: 'center' },
          xaxis: { categories: fechas },
          stroke: { curve: 'smooth' },
          dataLabels: { enabled: false },
          colors: ['#008FFB']
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar citas por fecha:', err)
    });
  }
}