import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { tap } from 'rxjs';
import { ILocation } from './interfaces/data.interface';
import { SERVICES } from './consts/util.const';
import { LocalizationsService } from './services/localizations.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'maps';

  public selectedOption = '';
  public options: string[] = Object.values(SERVICES).filter(value => typeof value === 'string');
  private map: any;
  public markersToShow = L.layerGroup();
  public markersToHide = L.layerGroup();
  public poiMarker!: any;
  public restaurantMarker!: any;

  private _safeLocations: ILocation[] = [];
  private _locations: ILocation[] = [];

  constructor(private readonly _localizationsService: LocalizationsService) {}
  
  ngOnInit(): void {
    this._getLocalizations();
    // 5b3ce3597851110001cf6248cf13756d65b8450dac5db87f0e28bdef
  }

  public setOption(selectedOption: string) {
    this.markersToShow.clearLayers();
    if (selectedOption === SERVICES.ALL) {
      this._setMarkers(this._safeLocations);
    } else {
      const filteredLocations = this._locations.filter(location => location.type === selectedOption);
      this._setMarkers(filteredLocations);
    }
  }

  private _setMarkers(locations: ILocation[]) {
    for (const location of locations) {
      const marker = L.marker(location.coords);
      marker.bindPopup(`<b>¡Hola!</b><br>Estás viendo ${location.name}`);
      this.markersToShow.addLayer(marker);
    }
  }

  private _getLocalizations() {
    this._localizationsService.getLocalizations().pipe(
      tap(response => {
        this._locations = response;
        this._safeLocations = response;
        this._initMap();
        })
    ).subscribe();
  }

  private _initMap() {
    this.map = L.map('map').setView([40.237, -6.046], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://c2o.es/">C2O Comunicación</a>'
    }).addTo(this.map);
    this.selectedOption = this.options[0];
    this._setMarkers(this._locations);
    this.markersToShow.addTo(this.map);

    /* L.Routing.control({
      waypoints: [
        L.latLng(40.26841, -6.10631),
        L.latLng(40.27745, -6.09372)
      ],
      routeWhileDragging: true,
      geocoder: L.Control.Geocoder.nominatim(),
      router: L.Routing.osrmv1({
        serviceUrl: 'https://api.openrouteservice.org/directions',
        apiKey: '5b3ce3597851110001cf6248cf13756d65b8450dac5db87f0e28bdef'
      })
    }).addTo(this.map); */
  }
}
