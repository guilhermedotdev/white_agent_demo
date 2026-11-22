import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<main>
    <h1>WhiteFleet - Agendamento de Veículos</h1>
    <nav>
      <button (click)="screen='vehicles'" aria-label="Ir para cadastro de veículos">Veículos</button>
      <button (click)="screen='employees'" aria-label="Ir para cadastro de colaboradores">Colaboradores</button>
      <button (click)="screen='availability'" aria-label="Ir para consulta de disponibilidade">Disponibilidade</button>
      <button (click)="screen='reservations'" aria-label="Ir para lista de reservas">Reservas</button>
    </nav>
    <section [ngSwitch]="screen">
      <app-vehicle-form *ngSwitchCase="'vehicles'"></app-vehicle-form>
      <app-employee-form *ngSwitchCase="'employees'"></app-employee-form>
      <app-availability *ngSwitchCase="'availability'"></app-availability>
      <app-reservations *ngSwitchCase="'reservations'"></app-reservations>
      <p *ngSwitchDefault>Selecione uma opção acima.</p>
    </section>
  </main>`
})
export class AppComponent {
  screen: 'vehicles' | 'employees' | 'availability' | 'reservations' | null = null;
}
