import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Inyección de dependencias moderna con inject()
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  vistaActual = 'login';

  credentials = {
    email: '',
    password: ''
  };

  errorMessage: string = '';
  mostrarPassword: boolean = false;

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

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (!this.credentials.email.trim() || !this.credentials.password.trim()) {
      this.errorMessage = 'Ingrese su correo y contraseña.';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // 1. Guardar el token devuelto por Spring Boot
        this.authService.setToken(response.token);

        // 2. Extraer módulos decodificados desde el JWT
        const session = this.sessionService.getInfoSession();
        const modulos = session?.modulos || [];

        // 3. Redirigir dinámicamente según el primer módulo disponible
        if (modulos.length > 0 && modulos[0].url) {
          this.router.navigate([modulos[0].url]);
        } else {
          this.router.navigate(['/dashboard/pacientes']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.status === 0
          ? 'No se pudo conectar con el servidor.'
          : (err.error?.message || 'Ocurrió un error inesperado.');
        this.cdr.detectChanges();
      }
    });
  }
}