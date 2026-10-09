import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  vistaActual = 'login';

  credentials = {
    username: '',
    password: ''
  };

  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef //  Inyectamos la detección de cambios
  ) {}

  irARecuperar() {
    this.vistaActual = 'recuperar';
  }

  volverAlLogin() {
    this.vistaActual = 'login';
    this.errorMessage = '';
  }

  limpiarError() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  iniciarSesion(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    //  Validación de campos vacíos
    if (!this.credentials.username.trim() || !this.credentials.password.trim()) {
      this.errorMessage = 'Por favor, ingrese su usuario y contraseña.';
      this.cdr.detectChanges(); // Forzar actualización de pantalla al 1er clic
      return;
    }

    this.errorMessage = '';

    // 2Intento de autenticación
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('nombreCompleto', response.nombreCompleto);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error de autenticación:', err);
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        this.cdr.detectChanges(); // Forzar la aparición del cartel en el 1er clic de respuesta de la API
      }
    });
  }
}