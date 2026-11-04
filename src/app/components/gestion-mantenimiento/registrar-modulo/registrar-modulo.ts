import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuloService, Modulo } from '../../../services/modulo.service'; // Ajusta la ruta a tu servicio

@Component({
  selector: 'app-registrar-modulo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-modulo.html',
  styleUrl: './registrar-modulo.css'
})
export class RegistrarModuloComponent implements OnInit {
  modulos: Modulo[] = [];
  nuevoModulo: Modulo = {
    descripcion: '',
    url: ''
  };
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(private moduloService: ModuloService) {}

  ngOnInit(): void {
    this.obtenerModulos();
  }

  obtenerModulos(): void {
    this.moduloService.listarModulos().subscribe({
      next: (data) => {
        this.modulos = data;
      },
      error: (err) => {
        console.error('Error al cargar módulos:', err);
      }
    });
  }

  guardarModulo(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.nuevoModulo.descripcion || !this.nuevoModulo.url) {
      this.mensajeError = 'Por favor, complete todos los campos.';
      return;
    }

    this.moduloService.registrarModulo(this.nuevoModulo).subscribe({
      next: (res) => {
        this.mensajeExito = 'Módulo registrado correctamente.';
        this.nuevoModulo = { descripcion: '', url: '' };
        this.obtenerModulos();
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.mensajeError = err.error.message;
        } else {
          this.mensajeError = 'Ocurrió un error al registrar el módulo.';
        }
      }
    });
  }
}