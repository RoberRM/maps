import { Component, EventEmitter, Output } from '@angular/core';
import { Marker } from 'mapbox-gl';
import { IDayData } from 'src/app/interfaces/day.interface';


@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.scss']
})
export class DateSelectorComponent {
  @Output('actionCompleted') actionCompleted = new EventEmitter<IDayData[]>();

  public startDate!: Date;
  public endDate!: Date;
  public dates: IDayData[] = [];
  public disabledButton = true;

  public getDiferenciaDias(): number | string {
    if (this.startDate && this.endDate && this.endDate >= this.startDate) {
      const diferenciaTiempo = this.endDate.getTime() - this.startDate.getTime();
      const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
      this.dates = [];
      let currentDate = new Date(this.startDate);
      for (let i = 0; i <= diferenciaDias; i++) {
        const fecha = new Date(currentDate);
        const diaSemana = currentDate.toLocaleString('es-ES', { weekday: 'long' });
        this.dates.push({date: fecha, weekDay: diaSemana, isSelected: false, wishlist: [], markers: [] as Marker[] });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      this.disabledButton = false;
      return `La diferencia de días es: ${diferenciaDias}`;
    } else {
      this.dates = [];
      this.disabledButton = true;
      return 'Ambas fechas deben estar seleccionadas.';
    }
  }

  public completeAction(): void {
    this.actionCompleted.emit(this.dates);
  }

}
