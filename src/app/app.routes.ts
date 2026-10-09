import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home'; 
import { LoginComponent } from './components/login/login'; 
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: HomeComponent },         
  { path: 'login', component: LoginComponent }, 
  { path: 'dashboard', component: DashboardComponent }, 
  { path: '**', redirectTo: '' }
];