import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h2>Cadastro de Veículos</h2>
  <form [formGroup]="form" (ngSubmit)="submit()" aria-label="Formulário de cadastro de veículos">
    <label for="plate">Placa:</label>
    <input id="plate" formControlName="plate" aria-required="true" />
    <div *ngIf="form.controls.plate.invalid && form.controls.plate.touched" role="alert">
      Placa é obrigatória e deve ser única.
    </div>

    <label for="brand">Marca:</label>
    <input id="brand" formControlName="brand" aria-required="true" />
    <div *ngIf="form.controls.brand.invalid && form.controls.brand.touched" role="alert">
      Marca é obrigatória.
    </div>

    <label for="model">Modelo:</label>
    <input id="model" formControlName="model" aria-required="true" />
    <div *ngIf="form.controls.model.invalid && form.controls.model.touched" role="alert">
      Modelo é obrigatório.
    </div>

    <label for="year">Ano:</label>
    <input id="year" type="number" formControlName="year" aria-required="true" min="1900" max="2100" />
    <div *ngIf="form.controls.year.invalid && form.controls.year.touched" role="alert">
      Ano válido é obrigatório.
    </div>

    <label for="active">Ativo:</label>
    <input id="active" type="checkbox" formControlName="active" />

    <button type="submit" [disabled]="form.invalid || loading">Cadastrar</button>
    <div *ngIf="error" role="alert" style="color:red">{{error}}</div>
    <div *ngIf="success" style="color:green">Veículo cadastrado com sucesso.</div>
  </form>
  `
})
export class VehicleFormComponent {
  form = this.fb.group({
    plate: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    model: ['', [Validators.required]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
    active: [true]
  });
  loading = false;
  error = '';
  success = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.success = false;
    const vehicle = {
      plate: this.form.value.plate?.trim(),
      brand: this.form.value.brand?.trim(),
      model: this.form.value.model?.trim(),
      year: this.form.value.year,
      active: this.form.value.active
    };
    // POST to /api/vehicles assumed but not implemented in backend context
    this.http.post('/api/vehicles', vehicle).subscribe({
      next: () => {
        this.success = true;
        this.form.reset({active:true, year: new Date().getFullYear()});
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao cadastrar veículo.';
      },
      complete: () => this.loading = false
    });
  }
}
