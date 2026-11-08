import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NgApexchartsModule, 
  ApexChart, 
  ApexAxisChartSeries, 
  ApexXAxis, 
  ApexTitleSubtitle, 
  ApexPlotOptions, 
  ApexDataLabels 
} from 'ng-apexcharts';
import { CitaService } from '../../../services/cita.service';

export type ChartOptionsColumn = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
  colors: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-chart-cita',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './chart-cita.html',
  styleUrl: './chart-cita.css'
})
export class ChartCitaComponent implements OnInit {
  private citaService = inject(CitaService);
  private cdr = inject(ChangeDetectorRef);

  public chartOptionsColumn: Partial<ChartOptionsColumn> = {
    series: [{ name: 'Citas', data: [] }],
    chart: { type: 'bar', height: 350, width: '100%' },
    title: { text: 'Citas Registradas por Médico', align: 'center' },
    xaxis: { categories: [] },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
    plotOptions: { bar: { horizontal: false, distributed: true } },
    dataLabels: { enabled: true }
  };

  ngOnInit(): void {
    this.getCitasPorMedicoCharts();
  }

  private getRandomColors(count: number): string[] {
    const palette = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5', '#4CAF50', '#FF9800'];
    return palette.slice(0, count);
  }

  getCitasPorMedicoCharts(): void {
    this.citaService.getNCitasXMedico().subscribe({
      next: (data) => {
        console.log('Respuesta backend NCitasXMedico:', data);

        if (!data || data.length === 0) return;

        const nombres = data.map(d => d.nombreMedico);
        const cantidades = data.map(d => d.cantidadCitas);
        const colores = this.getRandomColors(data.length);

        // Recrear el objeto completo para forzar la reactividad en ApexCharts
        this.chartOptionsColumn = {
          series: [
            {
              name: 'Citas Asignadas',
              data: cantidades
            }
          ],
          chart: { type: 'bar', height: 350, width: '100%' },
          title: { text: 'Citas Registradas por Médico', align: 'center' },
          xaxis: {
            categories: nombres,
            labels: {
              rotate: -45,
              style: { fontSize: '11px' }
            }
          },
          colors: colores,
          dataLabels: { enabled: true },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '45%',
              distributed: true
            }
          }
        };

        this.cdr.detectChanges(); // Forzar actualización de plantilla
      },
      error: (err) => console.error('Error al cargar citas por médico:', err)
    });
  }
}