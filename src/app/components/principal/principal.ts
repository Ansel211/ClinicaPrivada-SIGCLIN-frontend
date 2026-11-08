import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Modulo } from '../../model/modulo';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './principal.html',
  styleUrl: './principal.css'
})
export class PrincipalComponent implements OnInit {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  // Señal para almacenar la lista de módulos permitidos
  modulos = signal<Modulo[]>([]);

  ngOnInit(): void {
    const session = this.sessionService.getInfoSession();
    this.modulos.set(session?.modulos || []);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}