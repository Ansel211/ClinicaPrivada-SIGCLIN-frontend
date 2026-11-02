import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/acceso/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
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

  // Área privada de gestión (Dashboard con navegación interna)
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'citas', component: CitasComponent },
      { path: 'medicos', component: MedicosComponent },
      { path: 'pacientes', component: PacientesComponent }, 
      { path: 'registrar-rol', component: RegistrarRolComponent },
      { path: 'registrar-modulo', component: RegistrarModuloComponent },
      { path: 'registrar-usuario', component: RegistrarUsuarioComponent },
      { path: '', redirectTo: 'citas', pathMatch: 'full' }
    ]
  },

  // Redirección si escriben una URL inexistente
  { path: '**', redirectTo: 'home' }
];