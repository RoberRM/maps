import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import Geocoder from 'leaflet-control-geocoder';
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import { of, tap } from 'rxjs';
import { ILocation } from './interfaces/data.interface';
import { SERVICES } from './consts/util.const';
import { LocalizationsService } from './services/localizations.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  private waypoints: any;
  public markersToShow = L.layerGroup();
  public markersToHide = L.layerGroup();
  public poiMarker!: any;
  public restaurantMarker!: any;

  private _safeLocations: ILocation[] = [];
  private _locations: ILocation[] = [];

  constructor(private readonly _localizationsService: LocalizationsService) {}
  
  ngOnInit(): void {
    this._getLocalizations();
  }

  public setOption(selectedOption: string) {
    this.markersToShow.clearLayers();
    if (selectedOption === SERVICES.ALL) {
      this._setMarkers(this._safeLocations);
      this._setWaypoints(this._safeLocations);
      this._setPath();
    } else {
      const filteredLocations = this._locations.filter(location => location.type === selectedOption);
      this._setMarkers(filteredLocations);
      this._setWaypoints(filteredLocations);
      this._setPath();
    }
  }

  private _setMarkers(locations: ILocation[]) {
    for (const location of locations) {
      const marker = L.marker(location.coords);
      marker.bindPopup(`<b>¡Hola!</b><br>Estás viendo ${location.name}`);
      this.markersToShow.addLayer(marker);
    }
  }

  private _setWaypoints(locations: ILocation[]) {
    this.waypoints = locations.map(location => L.latLng(location.coords));
    console.log('waypoints: ', this.waypoints)
  }

  private _getLocalizations() {
    this._localizationsService.getLocalizations().pipe(
      tap(response => {
        this._locations = response;
        this._safeLocations = response;
        this._initMap();
        this._setWaypoints(this._locations);
        this._setPath();
        })
    ).subscribe();
  }

  private _initMap() {
    this.map = L.map('map').setView([40.237, -6.046], 12);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://c2o.es/">C2O Comunicación</a>'
    });
    tiles.addTo(this.map);

    (L.Control as any).geocoder().addTo(this.map);

    this.selectedOption = this.options[0];
    this._setMarkers(this._locations);
    this.markersToShow.addTo(this.map);
  }

  private _setPath() {
    const control = L.Routing.control({
      waypoints: this.waypoints,
      routeWhileDragging: true,
      geocoder: (L.Control as any).Geocoder.nominatim(),
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
    }).addTo(this.map);
  }

  /* exportToPDF() {
    const jsPDF = require('jspdf');
    require('jspdf-autotable');

    const doc = new jsPDF();
    const table = this._createPDFTable(); // Función para crear la tabla con las indicaciones
  
    // Agregar la tabla al documento PDF
    doc.autoTable({
      head: [['Indicaciones']],
      body: table,
    });
  
    // Guardar el PDF
    doc.save('indicaciones_ruta.pdf');
  } */
  
  /* private _createPDFTable() {
    const tableData = this._getDirectionsAsArray(); // Función para obtener las indicaciones como un arreglo
  
    return tableData!! ? tableData.map(item => [item]) : of(null);
  } */
  
  /* private _getDirectionsAsArray() {
    L.Routing.Control
    // Aquí obtienes las indicaciones como un arreglo de texto
    // Por ejemplo, puedes obtenerlas del objeto de ruta devuelto por leaflet-routing-machine
  } */
}
