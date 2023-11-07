import { Component } from '@angular/core';

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html',
  styleUrls: ['./user-config.component.scss']
})
export class UserConfigComponent {
  public startDate!: Date;
  public endDate!: Date;
  public dates: any[] = [];

  public getDiferenciaDias(): number | string {
    if (this.startDate && this.endDate && this.endDate >= this.startDate) {
      const diferenciaTiempo = this.endDate.getTime() - this.startDate.getTime();
      const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

      this.dates = [];
      let currentDate = new Date(this.startDate);

        for (let i = 0; i <= diferenciaDias; i++) {
          const fecha = new Date(currentDate);
          const diaSemana = currentDate.toLocaleString('es-ES', { weekday: 'long' });
          this.dates.push({fecha, diaSemana });
          currentDate.setDate(currentDate.getDate() + 1);
        }

      return `La diferencia de días es: ${diferenciaDias}`;
    } else {
      this.dates = [];
      return 'Ambas fechas deben estar seleccionadas.';
    }
  }
}
