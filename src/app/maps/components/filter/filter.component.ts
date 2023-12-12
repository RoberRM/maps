import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalizationsService, MapService } from 'src/app/services';
import { switchMap, of, tap, first } from 'rxjs';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output('filter') public filter = new EventEmitter<string>();
  public optionsMapping: { [key: string]: string } = {
    'Restablecer': 'restore',
    'Dónde dormir': 'where-to-sleep',
    'Dónde comer': 'where-to-eat',
    'Museos, Centros de Interpretación y oficinas de turismo': 'culture-resource',
    'Experiencias': 'experiences',
    /* 'Lista de deseos': 'wishlist', */
  };
  public options = Object.keys(this.optionsMapping);

  constructor(private placesService: PlacesService, private mapService: MapService, private localizationsService: LocalizationsService) {}

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

  public setFilter(option: string) {
    this.filter.emit(option);
    this.mapService.clearRouteIds()
    option === 'Restablecer' ? this._getLocalizations() : this._getLocalizationsWithFilter(this.optionsMapping[option]);
  }

  private _getLocalizations() {
    this.localizationsService.localizations$.pipe(
      first(),
      switchMap(resp => {
        this.mapService.createMarkersFromPlaces(resp as any[], this.placesService.userLocation!)
        return of(resp)
      })
    ).subscribe();
  }

  private _getLocalizationsWithFilter(filter: string) {
    this.localizationsService.localizations$.pipe(
      first(),
      switchMap(resp => {
        resp = resp.filter((item: any) => item.type.includes(filter))
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
