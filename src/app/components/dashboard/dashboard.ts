import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoService, Medico } from '../../services/medico.service';  // Ajusta la ruta si es necesario
import { CitaService } from '../../services/cita.service'; 
import { Component, OnInit, signal } from '@angular/core';   // agrega signal

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  nombreUsuario: string = 'Usuario';
  seccionActual: string = 'inicio';

  // se guardan los medicos que vengan de Supabase a travs de backend
 medicosDisponibles = signal<Medico[]>([]); 
 totalCitasPendientes = signal<number>(1);
 nuevaCita = {
    nombrePaciente: '',
    idMedico: '',
    fecha: '',
    hora: ''
  };
  constructor(
    private router: Router,
    private medicoService: MedicoService, // Inyectamos el servicio
    private citaService: CitaService
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
     this.medicosDisponibles.set(data);                         
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

  if (!this.nuevaCita.idMedico || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
    alert('Por favor complete todos los campos requeridos.');
    return;
  }

  const payload = {
    nombrePaciente: this.nuevaCita.nombrePaciente,
    idMedico: Number(this.nuevaCita.idMedico),
    fecha: this.nuevaCita.fecha,
    hora: this.nuevaCita.hora
  };

  // Petición real HTTP a la BD
  this.citaService.registrarCita(payload).subscribe({
    next: (response) => {
      alert('¡Cita registrada con éxito en la base de datos!');
      this.totalCitasPendientes.update((val) => val + 1);
      this.nuevaCita = { nombrePaciente: '', idMedico: '', fecha: '', hora: '' };
      this.cambiarSeccion('inicio');
    },
    error: (err) => {
      console.error('Error al guardar la cita:', err);
      alert('Hubo un error al registrar la cita en la base de datos.');
    }
  });
}

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}


