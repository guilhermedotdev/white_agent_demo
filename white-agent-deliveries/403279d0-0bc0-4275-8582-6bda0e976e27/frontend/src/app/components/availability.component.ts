import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  active: boolean;
}

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h2>Consultar Disponibilidade de Veículos</h2>
  <form [formGroup]="form" (ngSubmit)="checkAvailability()" aria-label="Formulário de consulta de disponibilidade">
    <label for="start">Data e Hora Inicial:</label>
    <input id="start" type="datetime-local" formControlName="start" aria-required="true" />
    <div *ngIf="form.controls.start.invalid && form.controls.start.touched" role="alert">
      Data e hora inicial válida é obrigatória.
    </div>

    <label for="end">Data e Hora Final:</label>
    <input id="end" type="datetime-local" formControlName="end" aria-required="true" />
    <div *ngIf="form.controls.end.invalid && form.controls.end.touched" role="alert">
      Data e hora final válida é obrigatória.
    </div>

    <button type="submit" [disabled]="form.invalid || loading">Consultar</button>
  </form>

  <div *ngIf="loading">Carregando veículos disponíveis...</div>
  <div *ngIf="error" role="alert" style="color:red">{{error}}</div>

  <ul *ngIf="vehicles.length">
    <li *ngFor="let v of vehicles">
      {{v.plate}} - {{v.brand}} {{v.model}} ({{v.year}})
    </li>
  </ul>
  <p *ngIf="!loading && !vehicles.length && !error">Nenhum veículo disponível para o período informado.</p>
  `
})
export class AvailabilityComponent {
  form = this.fb.group({
    start: ['', [Validators.required]],
    end: ['', [Validators.required]]
  });
  vehicles: Vehicle[] = [];
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  checkAvailability() {
    if (this.form.invalid) return;
    const start = this.form.value.start;
    const end = this.form.value.end;
    if (new Date(start) >= new Date(end)) {
      this.error = 'Data e hora final devem ser posteriores à inicial.';
      this.vehicles = [];
      return;
    }
    if (new Date(end) < new Date()) {
      this.error = 'Não é permitido consultar disponibilidade para período no passado.';
      this.vehicles = [];
      return;
    }
    this.loading = true;
    this.error = '';
    this.vehicles = [];
    const params = { start: start!, end: end! };
    this.http.get<Vehicle[]>('/api/reservations/availability', { params }).subscribe({
      next: data => {
        this.vehicles = data;
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao consultar disponibilidade.';
      },
      complete: () => this.loading = false
    });
  }
}
