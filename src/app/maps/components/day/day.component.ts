import { formatDate } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { tap } from 'rxjs';
import { CURRENTCOLORS, ORDER, imageBaseUrl, imageTypeMapping } from 'src/app/consts/util.const';
import { IDayData } from 'src/app/interfaces/day.interface';
import { MapService } from 'src/app/services';
import printJS from 'print-js';

type ImageSource = string | SafeUrl;
@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})

export class DayComponent implements OnInit, OnChanges {
  
  @Input('date') public date!: IDayData;
  @Input() public index: number = 0;
  @Input('isSelected') public isSelected!: boolean;
  @Input() public selectedColorIndex: number = 0;
  @ViewChild("print") print!: ElementRef;
  
  public selectedColor = '';
  public arrowsLength!: number;
  public report: any = null;
  public printSectionId = '';
  public imgBaseUrl = imageBaseUrl;
  public currentDateImages: ImageSource[] = [];

  constructor(private readonly mapService: MapService, public sanitizer: DomSanitizer) {}
  
  public ngOnInit(): void {
    this.isSelected = this.date.isSelected;
    this._handleArrows();
    this._setColor();
    this.printSectionId = 'printSection' + this.index;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    const currentDate = changes['date'].currentValue;
    if (currentDate.isSelected) {
      this.arrowsLength = currentDate.wishlist?.length;
    }
  }
  
  public setSelectedDay(day?: IDayData) {
    this.mapService.selectedDay = day ?? this.date;
    this._handleArrows();
    this._setColor();
  }

  public moveLocation(index: number, position: string) {
    const elementToMove = this.date.wishlist.splice(index, 1)[0];
    const newIndex = position === ORDER.UPWARD ? index - 1 : index + 1;
    this.date.wishlist.splice(newIndex, 0, elementToMove);
    this._notifyService();
  }
  
  public remove(index: number) {
    if (index >= 0 && index < this.date.wishlist.length) {
      const item = this.date.wishlist[index];
      const type = item.placeType ?? item.type;
      const id = item.placeId ?? item.id;
      const imageSrc = this.sanitizer.bypassSecurityTrustUrl(`${imageBaseUrl}/${imageTypeMapping[type]}/${id}.jpg`);
      const idx = this.currentDateImages.findIndex(item => item === imageSrc);
      if (idx !== -1) {
        this.currentDateImages.splice(idx, 1)
      }
      this.date.wishlist.splice(index, 1);
      this._notifyService();
    }
  }

  public getCurrentDateImages() {
    this.currentDateImages = [];
    this.date.wishlist.forEach((item: any) => {
      let imageSrc: ImageSource = '';
      if (item.id.length < 12 && ((item.placeType && item.placeId) ?? (item.type && item.id))) {
        const type = item.placeType ?? item.type;
        const id = item.placeId ?? item.id;
        if (item.hasImage) {
          imageSrc = this.sanitizer.bypassSecurityTrustUrl(`${imageBaseUrl}/${imageTypeMapping[type]}/${id}.jpg`)
        }
      }
      this.currentDateImages.push(imageSrc);
    });
  }

  private _resetCurrentDateImages() {
    this.currentDateImages = [];
  }

  private _setColor() {
    const colorIndex = ( (this.selectedColorIndex ?? 0) % 6 + 6) % 6;
    this.selectedColor = CURRENTCOLORS[colorIndex];
  }

  private _handleArrows() {
    this.mapService.showArrows.pipe(
      tap(res => {
        if (this.date.isSelected) {
          this.arrowsLength = res;
        }
      })
    ).subscribe();
  }

  private _notifyService() {
    this.mapService.wishlistFromSelectedDay(this.date.wishlist);
    this.mapService.recalculateDirections();
    this.mapService.allowSave = true;
  }

  public exportToPdf(date: IDayData) {
    if (date.wishlist.length <= 1) {
      this.mapService._showNotification('Añada al menos 2 destinos para exportar las indicaciones');
      return
    }
    this.getCurrentDateImages();

    const resultado = this._groupRoute(this.mapService.generateReport());    
    this.report = Object.values(resultado);
    this.mapService.wishlistFromSelectedDay(this.date.wishlist);
    setTimeout(() => {
      printJS({
        printable: this.printSectionId,
        type: 'html',
        style: `
        /* Estilos generales */
        body {
          font-family: 'Karla', sans-serif;
        }
        
        /* Estilos de títulos */
        h2 {
          display: block;
          text-align: center;
          padding-top: 1%;
        }

        h3 {
          text-align: center;
        }

        /* Estilos de imagen */
        #image, .lastImage {
          margin-bottom: 25px;
          text-align: center;
        }
        
        .showImage {
          border-radius: 10px;
          width: 350px !important;
          height: 300px !important;
        }

        .boldType {
          font-weight: bold;
        }

        .paddingTop {
          padding-top: 5px;
        }

        .separation {
          border-top: 1px solid lightgray; 
          margin-top: 10px; 
          margin-bottom: 10px;
        }

        /* Listas y distancias */
        li {
          font-weight: bold;
        }

        li span {
          font-weight: normal;
        }

        span {
          display: inline;
        }
      `,
        scanStyles: true
      })
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
