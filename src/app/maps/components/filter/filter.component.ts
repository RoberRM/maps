import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { first, map, of, switchMap } from 'rxjs';
import { optionsMapping, TYPE_COLORS } from 'src/app/consts/util.const';
import { LocalizationsService, MapService } from 'src/app/services';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output('filter') public filter = new EventEmitter<string>();
  public optionsMapping: { [key: string]: string } = optionsMapping;
  public options = Object.keys(this.optionsMapping);
  public optionsKey = Object.values(this.optionsMapping).filter(option => option !== 'restore');

  constructor(
    private readonly placesService: PlacesService, 
    private readonly mapService: MapService, 
    private readonly localizationsService: LocalizationsService
  ) {}

  ngOnInit(): void {
    const contenedor: any = document.getElementById('contenedor');
    const elemento: any = document.getElementById('elemento');

    contenedor?.addEventListener('click', () => {
      if (elemento?.classList.contains('mostrar')) {
        elemento?.classList.remove('mostrar');
      } else {
        elemento?.classList.add('mostrar');
      }
    })

    document.addEventListener('click', (event) => {
      if (contenedor && event.target !== contenedor && !contenedor.contains(event.target) && elemento?.classList.contains('mostrar')) {
        elemento?.classList.remove('mostrar');
      }
    })

  }

  public getBackgroundColor(index: number): string {
    if (index === 0) {
      return '#007BFF'
    }
    return TYPE_COLORS[index-1];
  }

  public setFilter(option: string) {
    this.filter.emit(option);
    this.mapService.clearRouteIds();
    option === 'Restablecer' ? this._getLocalizations() : this._getLocalizationsWithFilter(this.optionsMapping[option]);
  }

  private _getLocalizations() {
    this.localizationsService.localizations$.pipe(
      first(),
      map((resp: any) => resp.filter((item: any) => item.visible === "true")),
      switchMap((resp: any) => {
        this.mapService.createMarkersFromPlaces(resp as any[], this.placesService.userLocation!)
        return of(resp)
      })
    ).subscribe();
  }

  private _getLocalizationsWithFilter(filter: string) {
    this.localizationsService.localizations$.pipe(
      first(),
      switchMap(resp => {
        resp = resp.filter((item: any) => item.type?.includes(filter));
        resp ? 
          (
            this.mapService.createMarkersFromPlaces(resp as any[], this.placesService.userLocation!)
          )
          : this.mapService.resetMarkersFromPlaces();
        return of(resp)
      })
    ).subscribe();
  }
}
