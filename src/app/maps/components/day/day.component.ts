import { formatDate } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgxPrintService, PrintOptions } from 'ngx-print';
import { tap } from 'rxjs';
import { CURRENTCOLORS, ORDER } from 'src/app/consts/util.const';
import { IDayData } from 'src/app/interfaces/day.interface';
import { MapService } from 'src/app/services';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})

export class DayComponent implements OnInit {
  
  @Input('date') public date!: IDayData;
  @Input() public index: number = 0;
  @Input('isSelected') public isSelected!: boolean;
  @Input() public selectedColorIndex: number = 0;
  @ViewChild("print") print!: ElementRef;
  
  public selectedColor = '';
  public arrowsLength = 0;
  public report: any = null;
  public printSectionId = '';

  constructor(private mapService: MapService, private printService: NgxPrintService) {}
  
  public ngOnInit(): void {
    this.printSectionId = 'printSection' + this.index;
  }
  
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
    this._notifyService();
  }
  
  public remove(index: number) {
    if (index >= 0 && index < this.date.wishlist.length) {
      this.date.wishlist.splice(index, 1);
      this._notifyService();
    }
  }

  private _notifyService() {
    this.mapService.wishlistFromSelectedDay(this.date.wishlist);
    this.mapService.recalculateDirections();
  }

  public exportToPdf() {
    const resultado = this._groupRoute(this.mapService.generateReport());
    this.report = Object.values(resultado);

    const customPrintOptions: PrintOptions = new PrintOptions({
      printSectionId: this.printSectionId,
      printTitle: `ruta_${this._formatDate(this.date.date)}`,
      openNewTab: false,
    });
    this.mapService.wishlistFromSelectedDay(this.date.wishlist);
    setTimeout(() => {
      this.printService.print(customPrintOptions)
    }, 800);

  }

  private _formatDate(date: Date) {
    const format = 'dd_MM_yyyy';
    const locale = 'es-ES';

    return formatDate(date, format, locale);
  }

  private _groupRoute(report: any) {
    return report.reduce((agrupado: any, elemento: any) => {
      const { route, instructions, totalDistance, totalDuration } = elemento;
      if (!agrupado[route]) {
        agrupado[route] = {
          route,
          instructions: [],
          totalDistance,
          totalDuration
        };
      }
      agrupado[route].instructions.push(instructions);
    
      return agrupado;
    }, {});
  }
}
