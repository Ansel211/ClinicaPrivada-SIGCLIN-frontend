import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexChart, ApexAxisChartSeries, ApexNonAxisChartSeries, ApexXAxis, ApexTitleSubtitle, ApexResponsive, ApexPlotOptions, ApexLegend } from 'ng-apexcharts';
import { PersonaService } from '../../../services/persona.service';

export type ChartOptionsDonut = {
  title: ApexTitleSubtitle;
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  colors: string[];
  legend: ApexLegend;
};

export type ChartOptionsHorizontalBar = {
  title: ApexTitleSubtitle;
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  colors: string[];
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-chart-persona',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './chart-persona.html',
  styleUrl: './chart-persona.css'
})
export class ChartPersona implements OnInit {
  private personaService = inject(PersonaService);

  // Inicializar propiedades desde el inicio
  public chartOptionsDonut: Partial<ChartOptionsDonut> = {
    series: [],
    chart: { type: 'donut', height: 380 },
    title: { text: 'Proporción de Usuarios por Rol', align: 'center' },
    labels: [],
    colors: []
  };

  public chartOptionsBar: Partial<ChartOptionsHorizontalBar> = {
    series: [],
    chart: { type: 'bar', height: 380, width: '100%' },
    title: { text: 'Total de Usuarios por Rol', align: 'center' },
    xaxis: { categories: [] },
    colors: [],
    plotOptions: { bar: { horizontal: true, distributed: true } }
  };

  ngOnInit(): void {
    this.getNUsuariosXRolCharts();
  }

  private getRandomColors(count: number): string[] {
    const palette = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5'];
    return palette.slice(0, count);
  }

  getNUsuariosXRolCharts(): void {
    this.personaService.getNUsuariosXRol().subscribe({
      next: (data) => {
        const descripciones = data.map(d => d.descripcion);
        const cantidades = data.map(d => d.cantidad);
        const colores = this.getRandomColors(data.length);

        // Actualizar referencias reactivas de Donut
        this.chartOptionsDonut = {
          ...this.chartOptionsDonut,
          series: cantidades,
          labels: descripciones,
          colors: colores
        };

        // Actualizar referencias reactivas de Barras Horizontales
        this.chartOptionsBar = {
          ...this.chartOptionsBar,
          series: [
            {
              name: 'Usuarios registrados',
              data: cantidades
            }
          ],
          xaxis: {
            categories: descripciones
          },
          colors: colores
        };
      },
      error: (err) => {
        console.error('Error al cargar datos del backend:', err);
      }
    });
  }
}