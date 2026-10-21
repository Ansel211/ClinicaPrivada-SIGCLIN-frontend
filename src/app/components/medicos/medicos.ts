import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService } from '../../services/medico.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicos.html',
  styleUrl: './medicos.css'
})
export class MedicosComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private toastService = inject(ToastService);

  // Signal para mantener la lista actualizada
  listaMedicos = signal<any[]>([]);

  ngOnInit(): void {
    this.obtenerMedicos();
  }

  obtenerMedicos(): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.listaMedicos.set(data);
      },
      error: (err) => {
        console.error('Error al obtener la lista de médicos:', err);
        this.toastService.show('No se pudieron obtener los médicos.', 'danger');
      }
    });
  }
}