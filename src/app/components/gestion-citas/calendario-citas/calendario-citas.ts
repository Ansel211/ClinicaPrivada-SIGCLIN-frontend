import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../../services/cita.service';
import { MedicoService } from '../../../services/medico.service';
import { SessionService } from '../../../services/session.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-calendario-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario-citas.html',
  styleUrl: './calendario-citas.css'
})
export class CalendarioCitasComponent implements OnInit {
  private citaService = inject(CitaService);
  private medicoService = inject(MedicoService);
  private sessionService = inject(SessionService);
  private toastService = inject(ToastService);

  citas = signal<any[]>([]);
  medicos = signal<any[]>([]);

  // Filtros de búsqueda
  idMedicoFiltro: string = '';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';

  // Control de Acceso por Rol
  esRolRecepcionAdmin: boolean = true;
  miIdMedico: number | null = null;

ngOnInit(): void {
    const sesion = this.sessionService.getInfoSession();
    if (sesion) {
      // Manejamos si el rol viene como string u objeto (Rol) de forma segura
      const rolRaw = sesion.rol;
      let rolStr = '';
      if (typeof rolRaw === 'string') {
        rolStr = rolRaw;
      } else if (rolRaw && typeof rolRaw === 'object') {
        rolStr = (rolRaw as any).codigo || (rolRaw as any).descripcion || '';
      }
      
      const rol = rolStr.toLowerCase();
      
      // Si el rol es Personal Médico, filtramos automáticamente por su ID
      if (rol.includes('medico') || rol.includes('médico')) {
        this.esRolRecepcionAdmin = false;
        this.identificarMedicoLogueado(sesion.email);
      } else {
        // Recepción o Administrador ven acceso global
        this.esRolRecepcionAdmin = true;
        this.cargarMedicos();
        this.cargarCalendario();
      }
    } else {
      this.cargarMedicos();
      this.cargarCalendario();
    }
  }

  cargarMedicos(): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : (data?.content || data?.data || []);
        this.medicos.set(lista);
      },
      error: (err) => console.error('Error al cargar médicos:', err)
    });
  }

  identificarMedicoLogueado(emailUsuario: string): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : (data?.content || data?.data || []);
        this.medicos.set(lista);

        // Busca el médico que coincida con el correo del usuario logueado
        const medicoEncontrado = lista.find((m: any) => m.email === emailUsuario || m.correo === emailUsuario);
        if (medicoEncontrado) {
          this.miIdMedico = medicoEncontrado.id;
          this.cargarCalendario(this.miIdMedico!);
        } else if (lista.length > 0) {
          // Fallback por seguridad si no hay coincidencia exacta de correo
          this.miIdMedico = lista[0].id;
          this.cargarCalendario(this.miIdMedico!);
        }
      },
      error: (err) => console.error('Error al identificar al médico:', err)
    });
  }

  cargarCalendario(idMedicoForzado?: number): void {
    const medId = this.esRolRecepcionAdmin 
      ? (this.idMedicoFiltro ? Number(this.idMedicoFiltro) : undefined) 
      : (this.miIdMedico || idMedicoForzado);

    this.citaService.obtenerCitasCalendario(
      medId, 
      this.fechaInicioFiltro || undefined, 
      this.fechaFinFiltro || undefined
    ).subscribe({
      next: (data) => {
        this.citas.set(data);
      },
      error: (err) => {
        console.error('Error al cargar las citas del calendario:', err);
        this.toastService.show('Error al sincronizar la agenda médica.', 'danger');
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarCalendario();
  }

  limpiarFiltros(): void {
    this.idMedicoFiltro = '';
    this.fechaInicioFiltro = '';
    this.fechaFinFiltro = '';
    this.cargarCalendario();
  }
}