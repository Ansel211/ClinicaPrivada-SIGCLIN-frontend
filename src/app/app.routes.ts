import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CitasComponent } from './components/citas/citas';
import { MedicosComponent } from './components/medicos/medicos';

export const routes: Routes = [
  // Ruta por defecto: si entran a la raíz '/', los envía al Home público
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
      { path: '', redirectTo: 'citas', pathMatch: 'full' }
    ]
  },

  // Redirección si escriben una URL inexistente
  { path: '**', redirectTo: 'home' }
];