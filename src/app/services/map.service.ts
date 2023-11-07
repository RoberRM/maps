import { AfterViewInit, Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { DirectionsResponse, Route } from '../interfaces/directions.interface';
import { DirectionsApiClient } from '../maps/api';

@Injectable({
  providedIn: 'root'
})
export class MapService implements OnChanges, AfterViewInit {

  private map: Map | undefined;
  private markers: Marker[] = [];
  private addedRouteIds = new Set<string>();
  private wishlist: [number, number][] = [];

  get isMapReady() {
    return !!this.map;
  }

  constructor( private directionsApiClient: DirectionsApiClient ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes: ', changes)
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      console.log('after view init: ')

    }, 1500)
  }

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
    

    //TODO calcular la ruta entre puntos en vez de hacer tantas rutas como puntos hay empezando
    //TODO por el primer añadido a wishlist
    const addToTestRoute = (coords: [number, number][]) => {
      this.wishlist.push(...coords);

      if (this.addedRouteIds.size !== 0) {
          this.addedRouteIds.forEach(id => {
              if (this.map?.getLayer(id)) {
                  this.map.removeLayer(id);
                  this.map.removeSource(id);
              }
          });

          this.addedRouteIds.clear();
      }

      this._calculateRouteRecursively(this.wishlist);
  };

    for (const place of places) {
      const [lng, lat] = [place.coords[0], place.coords[1]];
      let el = document.createElement('div');
      el.id  = place.id;

      let popup = new Popup().setHTML(`
        <h6>${place.name}</h6>
        <span>${place.type}</span>
        <button id="add-to-wishlist">Añadir a Lista de deseos</button>
      `)

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
                  addToTestRoute([[lng, lat]]);
                }
              }
            }, 50)
        });
      newMarkers.push(newMarker);
    }
    this.markers = newMarkers;
    if (places.length === 0) return;
    // * Ajustar mapa a los marcadores mostrados
    const bounds = new LngLatBounds();
    newMarkers.forEach( marker => bounds.extend(marker.getLngLat()));
    bounds.extend(userLocation);

    this.map.fitBounds(bounds, {
      padding: 100
    });

    if (this.wishlist.length === 0) return;
  }

  private _calculateRouteRecursively(routeList: [number, number][]) {
    if (routeList.length < 2) return;

    const start = routeList[0];
    const end = routeList[1];
    const id = `RouteString_${start.join(',')}_${end.join(',')}`;
    const color = this._getRandomColor(); 

    this.getRouteBetweenPoints(start, end, id, color);
    this._calculateRouteRecursively(routeList.slice(1));
  }

  private _getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  public getRouteBetweenPoints( start: [number, number], end: [number, number], id: string, color: string) {
    this.directionsApiClient.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`)
      .subscribe( resp => this.drawPolyline(resp.routes[0], id, color))
  }

  private drawPolyline( route: Route, id: string, color: string ) {
    if( !this.map ) throw Error('Mapa no inicializado');

    console.log({kms: route.distance/1000, duration: route.duration/60});

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
}
