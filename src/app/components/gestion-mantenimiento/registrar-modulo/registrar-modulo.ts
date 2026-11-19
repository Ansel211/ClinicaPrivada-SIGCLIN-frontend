import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuloService, Modulo } from '../../../services/modulo.service'; // Ajusta la ruta a tu servicio
import { RegexConstants, REGEX_PATTERNS } from '../../../util/constant';

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
  public RC = RegexConstants;

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
    
    if (!REGEX_PATTERNS.TEXTO_GENERAL.test(this.nuevoModulo.descripcion.trim())) {
      this.mensajeError = 'La descripción contiene caracteres no permitidos o es muy corta.';
      return;
    }

    if (!REGEX_PATTERNS.URL_RUTA.test(this.nuevoModulo.url.trim())) {
      this.mensajeError = 'La URL debe empezar con "/" y solo contener letras, números o guiones (ej. /dashboard/doctores).';
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