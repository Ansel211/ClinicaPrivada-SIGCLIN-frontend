import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  nombreUsuario: string = 'Usuario';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('nombreCompleto');
    if (usuarioGuardado) {
      this.nombreUsuario = usuarioGuardado;
    }
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}