import { Component, Input } from '@angular/core';
import { CURRENTCOLORS } from 'src/app/consts/util.const';
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
  @Input() public selectedColorIndex: number = 0;
  public selectedColor = '';

  constructor(private mapService: MapService) {}
  
  public setSelectedDay() {
    this.mapService.selectedDay = this.date;
    const colorIndex = (this.selectedColorIndex % 6 + 6) % 6;
    this.selectedColor = CURRENTCOLORS[colorIndex];
  }

}
