import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface Reservation {
  id: number;
  vehiclePlate: string;
  employeeName: string;
  start: string;
  end: string;
  purpose: string;
  status: string;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h2>Reservas Futuras e em Andamento</h2>
  <button (click)="loadReservations()" aria-label="Atualizar lista de reservas">Atualizar</button>
  <div *ngIf="loading">Carregando reservas...</div>
  <div *ngIf="error" role="alert" style="color:red">{{error}}</div>

  <ul *ngIf="reservations.length">
    <li *ngFor="let r of reservations">
      <strong>{{r.vehiclePlate}}</strong> reservado por {{r.employeeName}}<br />
      De: {{r.start | date:'short'}} Até: {{r.end | date:'short'}}<br />
      Finalidade: {{r.purpose}}<br />
      <button (click)="cancelReservation(r.id)" aria-label="Cancelar reserva de {{r.vehiclePlate}}">Cancelar</button>
    </li>
  </ul>
  <p *ngIf="!loading && !reservations.length && !error">Nenhuma reserva futura ou em andamento.</p>

  <h3>Criar Nova Reserva</h3>
  <form [formGroup]="form" (ngSubmit)="createReservation()" aria-label="Formulário de criação de reserva">
    <label for="vehicleId">Veículo:</label>
    <input id="vehicleId" formControlName="vehicleId" placeholder="ID do veículo" aria-required="true" />

    <label for="employeeId">Colaborador:</label>
    <input id="employeeId" formControlName="employeeId" placeholder="ID do colaborador" aria-required="true" />

    <label for="start">Data e Hora Inicial:</label>
    <input id="start" type="datetime-local" formControlName="start" aria-required="true" />

    <label for="end">Data e Hora Final:</label>
    <input id="end" type="datetime-local" formControlName="end" aria-required="true" />

    <label for="purpose">Finalidade:</label>
    <input id="purpose" formControlName="purpose" aria-required="true" />

    <button type="submit" [disabled]="form.invalid || loading">Criar Reserva</button>
  </form>
  <div *ngIf="formError" role="alert" style="color:red">{{formError}}</div>
  <div *ngIf="formSuccess" style="color:green">Reserva criada com sucesso.</div>
  `
})
export class ReservationsComponent {
  reservations: Reservation[] = [];
  loading = false;
  error = '';
  formError = '';
  formSuccess = false;

  form = this.fb.group({
    vehicleId: ['', [Validators.required]],
    employeeId: ['', [Validators.required]],
    start: ['', [Validators.required]],
    end: ['', [Validators.required]],
    purpose: ['', [Validators.required]]
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.error = '';
    this.http.get<Reservation[]>('/api/reservations').subscribe({
      next: data => {
        this.reservations = data;
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao carregar reservas.';
      },
      complete: () => this.loading = false
    });
  }

  createReservation() {
    if (this.form.invalid) return;
    this.loading = true;
    this.formError = '';
    this.formSuccess = false;
    const reservation = {
      vehicleId: this.form.value.vehicleId,
      employeeId: this.form.value.employeeId,
      start: this.form.value.start,
      end: this.form.value.end,
      purpose: this.form.value.purpose?.trim()
    };
    if (new Date(reservation.start) >= new Date(reservation.end)) {
      this.formError = 'Data e hora final devem ser posteriores à inicial.';
      this.loading = false;
      return;
    }
    if (new Date(reservation.end) < new Date()) {
      this.formError = 'Não é permitido criar reserva para período no passado.';
      this.loading = false;
      return;
    }
    this.http.post('/api/reservations', reservation).subscribe({
      next: () => {
        this.formSuccess = true;
        this.form.reset();
        this.loadReservations();
      },
      error: err => {
        if (err.status === 409) {
          this.formError = 'Conflito de horário para o veículo selecionado.';
        } else {
          this.formError = err.error?.message || 'Erro ao criar reserva.';
        }
      },
      complete: () => this.loading = false
    });
  }

  cancelReservation(id: number) {
    if (!confirm('Confirma cancelamento da reserva?')) return;
    this.loading = true;
    this.error = '';
    this.http.post(`/api/reservations/${id}/cancel`, {}).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao cancelar reserva.';
      },
      complete: () => this.loading = false
    });
  }
}
