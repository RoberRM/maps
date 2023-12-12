import { Component } from '@angular/core';
import { CURRENTCOLORS } from 'src/app/consts/util.const';
import { IDayData } from 'src/app/interfaces/day.interface';
import { MapService } from 'src/app/services';

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html',
  styleUrls: ['./user-config.component.scss']
})
export class UserConfigComponent {
  public startDate!: Date;
  public endDate!: Date;
  public dates: IDayData[] = [];
  public colors = CURRENTCOLORS;

  constructor(private mapService: MapService) {}

  public getDiferenciaDias(): number | string {
    if (this.startDate && this.endDate && this.endDate >= this.startDate) {
      const diferenciaTiempo = this.endDate.getTime() - this.startDate.getTime();
      const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

      this.dates = [];
      let currentDate = new Date(this.startDate);
      for (let i = 0; i <= diferenciaDias; i++) {
        const fecha = new Date(currentDate);
        const diaSemana = currentDate.toLocaleString('es-ES', { weekday: 'long' });
        this.dates.push({date: fecha, weekDay: diaSemana, isSelected: false, wishlist: [] });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      this.mapService.dates = this.dates;
      return `La diferencia de días es: ${diferenciaDias}`;
    } else {
      this.dates = [];
      return 'Ambas fechas deben estar seleccionadas.';
    }
  }

  public updateSelectedDate(date: IDayData) {
    this.dates.forEach(date => date.isSelected = false);
    if (this.dates && this.dates.find(d => d === date)) {
      this.dates.find(d => d === date)!.isSelected = !date.isSelected;
    }
  }
}
