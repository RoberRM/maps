import { Injectable } from '@angular/core';
import { LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map: Map | undefined;
  private markers: Marker[] = [];

  get isMapReady() {
    return !!this.map;
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

  public createMarkersFromPlaces(places: any[], userLocation: [number, number]) {
    if (!this.map) throw Error('Mapa no inicializado');
    
    // console.log('PLACES -> ', places)
    this.markers.forEach(marker => marker.remove());
    const newMarkers = [];
    for (const place of places) {
      
      const [lng, lat] = [place.coords[0], place.coords[1]];
      const popup = new Popup().setHTML(`
        <h6>${place.name}</h6>
        <span>${place.type}</span>
      `)
      const newMarker = new Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);

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
    })
  }
}
