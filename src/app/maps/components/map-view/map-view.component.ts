import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Map } from 'mapbox-gl';
import { of, switchMap } from 'rxjs';
import { LocalizationsService } from 'src/app/services';
import { MapService } from '../../../services/map.service';
import { PlacesService } from '../../services/places.service';


@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  title = 'C2O Maps';
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

    /* const popup = new Popup()
      .setHTML(`
        <h6>Aqui estoy</h6>
        <span>Estoy en este sitio</span>
      `);
    
    new Marker({color: 'red'})
      .setLngLat( this.placesService.userLocation as LngLatLike)
      .setPopup(popup)
      .addTo(map) */

    this.mapService.setMap(map);
  }

  private _getLocalizations() {
    this.localizationsService.getLocalizations().pipe(
      switchMap(resp => {
        this.mapService.createMarkersFromPlaces(resp as unknown as any[], this.placesService.userLocation!)
        return of(resp)
      })
    ).subscribe();
  }

}
