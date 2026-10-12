import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicoService, Medico } from '../../services/medico.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  nombreUsuario: string = 'Usuario';
  seccionActual: string = 'inicio';

  // se guardan los medicos que vengan de Supabase a travs de backend
  medicosDisponibles: Medico[] = [];

  constructor(
    private router: Router,
    private medicoService: MedicoService // Inyectamos el servicio
  ) {}

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('nombreCompleto');
    if (usuarioGuardado) {
      this.nombreUsuario = usuarioGuardado;
    }

    // Cargamos los medicos desde la base de datos al iniciar el componente
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.medicosDisponibles = data;
      },
      error: (err) => {
        console.error('Error al cargar los médicos desde la BD:', err);
      }
    });
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActual = seccion;
  }

  registrarCita(event: Event): void {
    event.preventDefault();
    alert('¡Cita registrada con éxito (Modo simulación)!');
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}