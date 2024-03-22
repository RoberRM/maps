import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Marker } from 'mapbox-gl';
import { Subject, takeUntil, tap } from 'rxjs';
import { IDayData } from 'src/app/interfaces/day.interface';


@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.scss']
})
export class DateSelectorComponent implements OnDestroy, AfterViewInit {
  @Output('actionCompleted') actionCompleted = new EventEmitter<IDayData[]>();
  @ViewChild('picker') picker!: MatDatepicker<Date>;

  public startDate!: Date | null;
  public endDate!: Date | null;
  public dates: IDayData[] = [];
  public disabledButton = true;
  private unsubscribe$ = new Subject<void>();

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.picker) {
        this.picker.open();
        this.picker.closedStream.pipe(
          takeUntil(this.unsubscribe$),
          tap(() => this.openCalendar())
        ).subscribe()
      }
    }, 0);
  }
  
  public openCalendar() {
    const datepickerToggles = document.querySelector('.mat-datepicker-toggle');
    setTimeout(() => {
      if (datepickerToggles) {
        (datepickerToggles as any).click();
      }
    }, 120)
  }

  public onStartDateChange(event: MatDatepickerInputEvent<Date>) {
    this.startDate = event.value;
  }

  public onEndDateChange(event: MatDatepickerInputEvent<Date>) {
      this.endDate = event.value;
      this.getDiferenciaDias();
  }

  public getDiferenciaDias(): number | string {
    if (this.startDate && this.endDate) {
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
      this.actionCompleted.emit(this.dates);
      return `La diferencia de días es: ${diferenciaDias}`;
    } else {
      this.dates = [];
      return 'Ambas fechas deben estar seleccionadas.';
    }
  }

  public preventClose(event: MouseEvent) {
    // Evita que el evento clic se propague y cierre el componente
    event.stopPropagation();
  }
}
