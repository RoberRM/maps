import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { tap } from 'rxjs';
import { CURRENTCOLORS } from '../consts/util.const';
import { IDayData } from '../interfaces/day.interface';
import { DirectionsResponse, Route } from '../interfaces/directions.interface';
import { DirectionsApiClient } from '../maps/api';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private _map: Map | undefined;
  private _markers: Marker[] = [];
  private _routeMarkers: Marker[] = [];
  private _addedRouteIds = new Set<string>();
  private _selectedDay!: IDayData;
  private _dates: any[] = [];
  private _places!: any[];
  private _userLocation!: [number, number];
  private _wishlist: [number, number][] = [];
  private _route: Route[] = [];

  public showArrows = new EventEmitter<number>();

  get isMapReady() {
    return !!this._map;
  }

  public set selectedDay(day: IDayData) {
    this._selectedDay = day;
    if (this._addedRouteIds.size !== 0) {
      this.clearRouteIds();
    }
    document.querySelector('.mapboxgl-popup')?.remove()
    this._dates.filter(d => d !== this._selectedDay).forEach(date => {
      date.isSelected = false
    })
    const currentDate = this._dates.find(d => d === this._selectedDay);
    currentDate.isSelected = true;
    if (currentDate && currentDate.wishlist.length > 1) {
      this._checkDirections();
    } else {
      this._centerMap();
    }
  }

  public get selectedDay() {
    return this._selectedDay
  }

  public get selectedDayIndex() {
    return this.dates.findIndex(date => date.isSelected);
  }

  public get dates() {
    return this._dates;
  }

  public set dates(dates: any[]) {
    this._dates = dates;
  }

  constructor( private directionsApiClient: DirectionsApiClient, private snackBar: MatSnackBar ) {}

  setMap(map: Map) {
    this._map = map;
  }

  flyTo(coords: LngLatLike) {
    if(!this.isMapReady) throw Error('El mapa no está inicializado');

    this._map?.flyTo({
      zoom: 14,
      center: coords
    })
  }

  public resetMarkersFromPlaces() {
    this._markers.forEach(marker => marker.remove());
  }

  public createMarkersFromPlaces(places: any[], userLocation: [number, number]) {
    if (!this._map) throw Error('Mapa no inicializado');
    this._markers.forEach(marker => marker.remove());
    const newMarkers = [];
    this._places = places;
    this._userLocation = userLocation;

    const addToRoute = (coords: [number, number][], placeName: string, marker: Marker) => {
      if (!this._selectedDay) {
        this._showNotification('Añade al menos dos puntos a la lista de deseos para calcular la ruta.');
        return
      }
      this._checkDirections(coords, placeName, marker);
    };

    for (const place of places) {
      const [lng, lat] = [place.coords[0], place.coords[1]];
      let el = document.createElement('div');
      el.id  = place.id;

      let popupContent = `
        <h6>${place.name}</h6>
        <button id="add-to-wishlist">Añadir a día seleccionado</button>
      `;

      let popup = new Popup().setHTML(`<div class="custom-popup">${popupContent}</div>`)

      const newMarker = new Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this._map);

      newMarker.getElement()
        .addEventListener('click', () => {
            setTimeout(() => {
              const add = document.querySelector("#add-to-wishlist");
              if (add instanceof HTMLButtonElement) {
                add.onclick = function() {
                  addToRoute([[lng, lat]], place.name, newMarker);
                  document.querySelector('.mapboxgl-popup')?.remove();
                }
              }
            }, 50)
        });
      newMarkers.push(newMarker);
    }
    this._markers = newMarkers;
    if (places.length === 0) return;
    // * Ajustar mapa a los marcadores mostrados
    this._centerMap();
    if (this._wishlist.length === 0) return;
  }

  private _centerMap() {
    const bounds = new LngLatBounds();
    this._markers.forEach(marker => bounds.extend(marker.getLngLat()));
    bounds.extend(this._userLocation);

    this._map?.fitBounds(bounds, {
      padding: 100
    });
  }

  private _showNotification(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, 
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  private _checkDirections(coords?: [number, number][], placeName?: string, marker?: Marker) {
    const currentDayIndex = this._dates.findIndex(d => d === this._selectedDay);
    const currentDate = this._dates[currentDayIndex];
    const colorIndex = (currentDayIndex % 6 + 6) % 6;
    
    if (currentDate) {
      if (!!coords && !!placeName) {
        currentDate.wishlist.push({coords: coords, name: placeName, marker: marker});
        if (marker) this._routeMarkers.push(marker);
      }
      this.showArrows.emit(currentDate.wishlist.length);
      if (currentDate.wishlist.length > 1) {
        if (this._addedRouteIds.size !== 0) {
          this.clearRouteIds();
        }
        currentDate.wishlist.forEach((item: any) => {
          const found = this._routeMarkers.find(marker => marker === item.marker)
          if (!found) this._routeMarkers.push(item.marker)
        });
        this._calculateRouteRecursively(currentDate.wishlist.map((item: any) => item.coords), colorIndex, currentDate.wishlist.map((item: any) => item.markers));
        setTimeout(() => {
          this.generateReport();
        }, 600);
      }
    }
  }

  public recalculateDirections() {
    this._checkDirections();
  }

  public clearRouteIds() {
    this._route = [];
    this._routeMarkers = [];
    this._addedRouteIds.forEach(id => {
      if (this._map?.getLayer(id)) {
          this._map.removeLayer(id);
          this._map.removeSource(id);
      }
    });
    this._addedRouteIds.clear();
  }

  private _calculateRouteRecursively(routeList: [number, number][], colorIndex: number, markers: Marker[]) {
    if (routeList.length < 2) return;

    const start = routeList[0];
    const end = routeList[1];
    const id = `RouteString_${start.join(',')}_${end.join(',')}`;

    this.getRouteBetweenPoints(start, end, id, CURRENTCOLORS[colorIndex]);
    this._calculateRouteRecursively(routeList.slice(1), colorIndex, markers);
  }

  public getRouteBetweenPoints( start: [number, number], end: [number, number], id: string, color: string) {
    this._route = [];
    this.directionsApiClient.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`)
      .pipe(
        tap(resp => {
          this._route.push(resp.routes[0]);
          this.drawPolyline(id, color);
          const bounds = new LngLatBounds();
          this._routeMarkers.forEach(routeMarker => bounds.extend(routeMarker.getLngLat()));
          this._map?.fitBounds(bounds, {
            padding: 200,
          });
        })
      )
      .subscribe()
  }

  private drawPolyline(id: string, color: string ) {
    if( !this._map ) throw Error('Mapa no inicializado');
    this._route.forEach((route: Route) => {
      this._addedRouteIds.add(id);  
      const sourceData: AnySourceData = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.geometry.coordinates,
              },
            },
          ],
        },
      };
  
      // * Limpia la ruta previa
      if (this._map?.getLayer(id)) {
        this._map.removeLayer(id);
        this._map.removeSource(id);
      }
      this._map?.addSource(id, sourceData);
      this._map?.addLayer({
        id: id,
        type: 'line',
        source: id,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': 3,
        },
      });
    });
  }

  public generateReport() {
    const explainedRoute: { route: number, instructions?: {duration: number, distance: number, maneuver: string}, totalDistance: number, totalDuration: number, destination?: string }[] = [];
    this._route.forEach((route, index) => {
      route.legs.forEach(element => {
        element.steps.forEach(step => {
          const instruction: {duration: number, distance: number, maneuver: string} = {duration: step.duration/60, distance: step.distance/1000, maneuver: step.maneuver.instruction}
          explainedRoute.push({route: index, instructions: instruction, totalDistance: route.distance/1000, totalDuration: route.duration/60})
        })
      });
    })
    return explainedRoute
  }
}
