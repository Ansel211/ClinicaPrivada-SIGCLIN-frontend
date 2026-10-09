import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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
    private cdr: ChangeDetectorRef
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

    if (!this.credentials.username.trim() || !this.credentials.password.trim()) {
      this.errorMessage = 'Por favor, ingrese su usuario y contraseña.';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('nombreCompleto', response.nombreCompleto);

        this.router.navigate(['/dashboard']);
      },
      
      error: (err: HttpErrorResponse) => {
        console.log(err);
        console.log('Login failed');
        
        // Extrae el mensaje dinámico enviado por Spring Boot o usa un fallback
        const mensajeError = err.error?.message || 'Usuario o contraseña incorrectos.';
        this.errorMessage = mensajeError;
        
        this.cdr.detectChanges();
      }
    });
  }
}