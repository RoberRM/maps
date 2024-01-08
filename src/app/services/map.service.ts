import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { CURRENTCOLORS } from '../consts/util.const';
import { IDayData } from '../interfaces/day.interface';
import { DirectionsResponse, Route } from '../interfaces/directions.interface';
import { DirectionsApiClient } from '../maps/api';
import { PlacesService } from '../maps/services/places.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map: Map | undefined;
  private markers: Marker[] = [];
  private addedRouteIds = new Set<string>();
  private _selectedDay!: IDayData;
  private _dates: any[] = [];
  private _places!: any[];
  private _userLocation!: [number, number];
  private wishlist: [number, number][] = [];
  private _route: Route[] = [];

  public showArrows = new EventEmitter<number>();

  get isMapReady() {
    return !!this.map;
  }

  public set selectedDay(day: IDayData) {
    this._selectedDay = day;
    if (this.addedRouteIds.size !== 0) {
      this.clearRouteIds();
    }
    document.querySelector('.mapboxgl-popup')?.remove()
    const currentDate = this._dates.find(d => d === this._selectedDay);
    if (currentDate && currentDate.wishlist.length > 1) {
      this._checkDirections();
    } else {
      this._centerMap();
    }
  }

  public get dates() {
    return this._dates;
  }

  public set dates(dates: any[]) {
    this._dates = dates;
  }

  constructor( private directionsApiClient: DirectionsApiClient, private _placesService: PlacesService, private snackBar: MatSnackBar ) {}

  // TODO actualizar this._dates para que lo muestren también los componentes que lo usan

  setMap(map: Map) {
    this.map = map;
  }

  flyTo(coords: LngLatLike) {
    if(!this.isMapReady) throw Error('El mapa no está inicializado');

    this.map?.flyTo({
      zoom: 14,
      center: coords
    })
  }

  public resetMarkersFromPlaces() {
    this.markers.forEach(marker => marker.remove());
  }

  public createMarkersFromPlaces(places: any[], userLocation: [number, number]) {
    if (!this.map) throw Error('Mapa no inicializado');
    this.markers.forEach(marker => marker.remove());
    const newMarkers = [];
    this._places = places;
    this._userLocation = userLocation;

    //TODO calcular la ruta entre puntos en vez de hacer tantas rutas como puntos hay empezando
    //TODO por el primer añadido a wishlist
    const addToRoute = (coords: [number, number][], placeName: string, placeType: string) => {
      if (!this._selectedDay) {
        this._showNotification('Añade al menos dos puntos a la lista de deseos para calcular la ruta.');
        return
      }
      this._checkDirections(coords, placeName);
    };

    for (const place of places) {
      const [lng, lat] = [place.coords[0], place.coords[1]];
      let el = document.createElement('div');
      el.id  = place.id;

      /* let popupContent = `
        <h6>${place.name}</h6>
        <span>${place.type}</span>
        <button id="add-to-wishlist">Añadir a día seleccionado</button>
      `; */
      let popupContent = `
        <h6>${place.name}</h6>
        <button id="add-to-wishlist">Añadir a día seleccionado</button>
      `;

      let popup = new Popup().setHTML(`<div class="custom-popup">${popupContent}</div>`)

      const newMarker = new Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);

      newMarker.getElement()
        .addEventListener('click', () => {
            setTimeout(() => {
              const add = document.querySelector("#add-to-wishlist");
              if (add instanceof HTMLButtonElement) {
                add.onclick = function() {
                  addToRoute([[lng, lat]], place.name, place.type);
                  document.querySelector('.mapboxgl-popup')?.remove();
                }
              }
            }, 50)
        });
      newMarkers.push(newMarker);
    }
    this.markers = newMarkers;
    if (places.length === 0) return;
    // * Ajustar mapa a los marcadores mostrados
    this._centerMap();
    if (this.wishlist.length === 0) return;
  }

  private _centerMap() {
    const bounds = new LngLatBounds();
    this.markers.forEach( marker => bounds.extend(marker.getLngLat()));
    bounds.extend(this._userLocation);

    this.map?.fitBounds(bounds, {
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

  private _checkDirections(coords?: [number, number][], placeName?: string) {
    const currentDayIndex = this._dates.findIndex(d => d === this._selectedDay);
    const currentDate = this._dates[currentDayIndex];
    const colorIndex = (currentDayIndex % 6 + 6) % 6;
    
    if (currentDate) {
      if (!!coords && !!placeName) {
        currentDate.wishlist.push({coords: coords, name: placeName});
      }
      this.showArrows.emit(currentDate.wishlist.length);
      if (currentDate.wishlist.length > 1) {
        if (this.addedRouteIds.size !== 0) {
          this.clearRouteIds();
        }
        this._calculateRouteRecursively(currentDate.wishlist.map((item: any) => item.coords), colorIndex);
      }
    }
  }

  public recalculateDirections() {
    this._checkDirections();
  }

  public clearRouteIds() {
    this._route = [];
    this.addedRouteIds.forEach(id => {
      if (this.map?.getLayer(id)) {
          this.map.removeLayer(id);
          this.map.removeSource(id);
      }
    });
    this.addedRouteIds.clear();
  }

  private _calculateRouteRecursively(routeList: [number, number][], colorIndex: number) {
    if (routeList.length < 2) return;

    const start = routeList[0];
    const end = routeList[1];
    const id = `RouteString_${start.join(',')}_${end.join(',')}`;

    this.getRouteBetweenPoints(start, end, id, CURRENTCOLORS[colorIndex]);
    this._calculateRouteRecursively(routeList.slice(1), colorIndex);
  }

  public getRouteBetweenPoints( start: [number, number], end: [number, number], id: string, color: string) {
    this.directionsApiClient.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`)
      .subscribe( resp => this.drawPolyline(resp.routes[0], id, color))
  }

  private drawPolyline( route: Route, id: string, color: string ) {
    if( !this.map ) throw Error('Mapa no inicializado');

    this._route.push(route);

    this.addedRouteIds.add(id);
    const coords = route.geometry.coordinates;
    const bounds = new LngLatBounds();
    coords.forEach(([lng, lat]) => {
      bounds.extend([lng, lat])
    })
    this.map?.fitBounds( bounds, {
      padding: 200
    })

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
              coordinates: coords
            }
          }
        ]
      }
    }
    // * Limpia la ruta previa
    if(this.map.getLayer(id)) {
      this.map.removeLayer(id);
      this.map.removeSource(id);
    }
    this.map.addSource(id, sourceData);
    this.map.addLayer({
      id: id,
      type: 'line',
      source: id,
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': 3
      }
    })
  }

  public generateReport() {
    console.log('ROUTES: ', this._route);
    this._route.forEach(route => {
      console.log({kms: route.distance/1000, duration: route.duration/60});
    })
  }
}
