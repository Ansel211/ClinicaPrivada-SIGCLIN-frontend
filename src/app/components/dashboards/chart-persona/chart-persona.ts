import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexChart, ApexAxisChartSeries, ApexTitleSubtitle, ApexLegend } from 'ng-apexcharts';
import { PersonaService } from '../../../services/persona.service';
import { ChartCitaComponent } from '../chart-cita/chart-cita';

export type ChartOptionsDonut = {
  series: number[];
  chart: ApexChart;
  title: ApexTitleSubtitle;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
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
  private cdr = inject(ChangeDetectorRef);

  public chartOptionsDonut: Partial<ChartOptionsDonut> = {
    series: [],
    chart: { type: 'donut', height: 350 },
    title: { text: 'Proporción de Usuarios por Rol', align: 'center' },
    labels: [],
    colors: []
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
}