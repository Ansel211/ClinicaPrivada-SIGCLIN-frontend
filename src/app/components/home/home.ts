import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule], 
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  imagenesBanner: string[] = [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1600&auto=format&fit=crop'
  ];
  
  indiceActual: number = 0;
  private intervaloBanner: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Cambia de imagen cada 3 segundos
    this.intervaloBanner = setInterval(() => {
      this.indiceActual = (this.indiceActual + 1) % this.imagenesBanner.length;
      this.cdr.detectChanges(); 
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.intervaloBanner) {
      clearInterval(this.intervaloBanner);
    }
  }
}