import { Component, Input, AfterViewInit } from '@angular/core';
import { IDayData } from 'src/app/interfaces/day.interface';
import { MapService } from 'src/app/services';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})

export class DayComponent {
  @Input('date') public date!: IDayData;
  @Input('isSelected') public isSelected!: boolean;

  constructor(private mapService: MapService) {}
  
  public setSelectedDay() {
    this.mapService.selectedDay = this.date;
  }

}
