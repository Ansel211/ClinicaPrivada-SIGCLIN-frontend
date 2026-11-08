import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { moduloGuard } from './guards/modulo.guard';

import { ChartPersona } from './components/dashboards/chart-persona/chart-persona';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/acceso/login/login';
import { PrincipalComponent } from './components/principal/principal'; 
import { CitasComponent } from './components/gestion-citas/citas/citas';
import { MedicosComponent } from './components/gestion-medica/medicos/medicos';
import { PacientesComponent } from './components/gestion-pacientes/pacientes/pacientes'; 
import { RegistrarRolComponent } from './components/gestion-mantenimiento/registrar-rol/registrar-rol';
import { RegistrarModuloComponent } from './components/gestion-mantenimiento/registrar-modulo/registrar-modulo';
import { RegistrarUsuarioComponent } from './components/gestion-mantenimiento/registrar-usuario/registrar-usuario';
export const routes: Routes = [
  
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Páginas públicas
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  // Área privada de gestión (Principal con navegación interna)
  {
    path: 'principal',
    component: PrincipalComponent,
    canActivate: [authGuard], // Bloquea todo /Principal si no hay sesión activa
    children: [

      {
      path: 'Inicio',
      component: ChartPersona,
      canActivate: [moduloGuard]
      },
      { 
        path: 'citas', 
        component: CitasComponent,
        canActivate: [moduloGuard] // Valida acceso según el rol del usuario
      },
      { 
        path: 'medicos', 
        component: MedicosComponent,
        canActivate: [moduloGuard] 
      },
      { 
        path: 'pacientes', 
        component: PacientesComponent,
        canActivate: [moduloGuard] 
      },
      { 
        path: 'registrar-rol', 
        component: RegistrarRolComponent,
        canActivate: [moduloGuard] 
      },
      { 
        path: 'registrar-modulo', 
        component: RegistrarModuloComponent,
        canActivate: [moduloGuard] 
      },
      { 
        path: 'registrar-usuario', 
        component: RegistrarUsuarioComponent,
        canActivate: [moduloGuard] 
      },
      { path: '', redirectTo: 'Inicio', pathMatch: 'full' }
    ]
  },

  // Redirección si escriben una URL inexistente
  { path: '**', redirectTo: 'home' }
];