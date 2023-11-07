import { AfterViewInit, OnInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Map, Popup, Marker, LngLatLike } from 'mapbox-gl';
import { PlacesService } from '../../services/places.service';
import { MapService } from '../../../services/map.service';
import { LocalizationsService } from 'src/app/services';
import { tap, switchMap, of, debounceTime } from 'rxjs';


@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  title = 'My first AGM project';
  lat = 51.678418;
  lng = 7.809007;

  @ViewChild('mapDiv', {static: true}) mapDivElement!: ElementRef;

  constructor( private placesService: PlacesService, private mapService: MapService, private localizationsService: LocalizationsService ) {}

  ngOnInit(): void {
    this._getLocalizations();
  }

  ngAfterViewInit(): void {
    if (!this.placesService.userLocation) throw Error('No hay placesService.userLocation');

    const map = new Map({
      container: this.mapDivElement.nativeElement,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: this.placesService.userLocation,
      zoom: 14
    });

    const popup = new Popup()
      .setHTML(`
        <h6>Aqui estoy</h6>
        <span>Estoy en este sitio</span>
      `);
    
    new Marker({color: 'red'})
      .setLngLat( this.placesService.userLocation as LngLatLike)
      .setPopup(popup)
      .addTo(map)

    this.mapService.setMap(map);
  }

  private _getLocalizations() {
    this.localizationsService.getLocalizations().pipe(
      switchMap(resp => {
        this.mapService.createMarkersFromPlaces(resp as any[], this.placesService.userLocation!)
        return of(resp)
      })
    ).subscribe();
  }

}
