import { Component, Input } from '@angular/core';
import { tap } from 'rxjs';
import { CURRENTCOLORS, ORDER } from 'src/app/consts/util.const';
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
  public arrowsLength = 0;

  constructor(private mapService: MapService) {}
  
  public setSelectedDay() {
    this.mapService.showArrows.pipe(
      tap(res => this.arrowsLength = res)
    ).subscribe()
    
    this.mapService.selectedDay = this.date;
    const colorIndex = (this.selectedColorIndex % 6 + 6) % 6;
    this.selectedColor = CURRENTCOLORS[colorIndex];
  }

  public moveLocation(index: number, position: string) {
    const elementToMove = this.date.wishlist.splice(index, 1)[0];
    const newIndex = position === ORDER.UPWARD ? index - 1 : index + 1;
    this.date.wishlist.splice(newIndex, 0, elementToMove);
    this.mapService.recalculateDirections();
  }

  public remove(index: number) {
    if (index >= 0 && index < this.date.wishlist.length) {
      this.date.wishlist.splice(index, 1);
      this.mapService.recalculateDirections();
    }
  }

  public exportToPdf() {
    console.log('Exportar a PDF el día seleccionado')
    this.mapService.generateReport();
  }

}
