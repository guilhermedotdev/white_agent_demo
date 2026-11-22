import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h2>Cadastro de Colaboradores</h2>
  <form [formGroup]="form" (ngSubmit)="submit()" aria-label="Formulário de cadastro de colaboradores">
    <label for="name">Nome:</label>
    <input id="name" formControlName="name" aria-required="true" />
    <div *ngIf="form.controls.name.invalid && form.controls.name.touched" role="alert">
      Nome é obrigatório.
    </div>

    <label for="email">E-mail:</label>
    <input id="email" type="email" formControlName="email" aria-required="true" />
    <div *ngIf="form.controls.email.invalid && form.controls.email.touched" role="alert">
      E-mail válido é obrigatório.
    </div>

    <button type="submit" [disabled]="form.invalid || loading">Cadastrar</button>
    <div *ngIf="error" role="alert" style="color:red">{{error}}</div>
    <div *ngIf="success" style="color:green">Colaborador cadastrado com sucesso.</div>
  </form>
  `
})
export class EmployeeFormComponent {
  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
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
    const employee = {
      name: this.form.value.name?.trim(),
      email: this.form.value.email?.trim()
    };
    // POST to /api/employees assumed but not implemented in backend context
    this.http.post('/api/employees', employee).subscribe({
      next: () => {
        this.success = true;
        this.form.reset();
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao cadastrar colaborador.';
      },
      complete: () => this.loading = false
    });
  }
}
